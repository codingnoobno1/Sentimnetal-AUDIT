import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'dart:convert';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'sentinel_smart_memory.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Stores command history and intents
    await db.execute('''
      CREATE TABLE command_history(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_input TEXT,
        intent TEXT,
        actions_json TEXT,
        status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    // Stores key-value "smart" facts about the system
    await db.execute('''
      CREATE TABLE system_facts(
        fact_key TEXT PRIMARY KEY,
        fact_value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    // Caches recent API results for context building
    await db.execute('''
      CREATE TABLE api_cache(
        cache_key TEXT PRIMARY KEY,
        json_data TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    ''');
  }

  // --- Facts & Memory Management ---

  Future<void> upsertFact(String key, String value) async {
    final db = await database;
    await db.insert(
      'system_facts',
      {'fact_key': key, 'fact_value': value, 'updated_at': DateTime.now().toIso8601String()},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<Map<String, String>> getAllFacts() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('system_facts');
    return {for (var m in maps) m['fact_key'] as String: m['fact_value'] as String};
  }

  // --- API Caching ---

  Future<void> cacheApiResult(String key, dynamic data) async {
    final db = await database;
    await db.insert(
      'api_cache',
      {'cache_key': key, 'json_data': jsonEncode(data), 'updated_at': DateTime.now().toIso8601String()},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<dynamic> getCachedResult(String key) async {
    final db = await database;
    final List<Map<String, dynamic>> results = await db.query(
      'api_cache',
      where: 'cache_key = ?',
      whereArgs: [key],
    );
    if (results.isNotEmpty) {
      return jsonDecode(results.first['json_data']);
    }
    return null;
  }

  // --- History ---

  Future<void> recordCommand(String input, String intent, List<dynamic> actions) async {
    final db = await database;
    await db.insert('command_history', {
      'user_input': input,
      'intent': intent,
      'actions_json': jsonEncode(actions),
      'status': 'success',
    });
  }

  Future<List<Map<String, dynamic>>> getRecentHistory({int limit = 5}) async {
    final db = await database;
    return await db.query('command_history', orderBy: 'timestamp DESC', limit: limit);
  }
}
