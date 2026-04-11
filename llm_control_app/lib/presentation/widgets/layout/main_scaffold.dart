import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../navigation/sidebar.dart';
import '../navigation/header.dart';
import '../../../core/theme.dart';

class MainScaffold extends StatefulWidget {
  final List<Widget> screens;
  final List<String> titles;

  const MainScaffold({
    super.key,
    required this.screens,
    required this.titles,
  });

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool isMobile = width < 900;

    Widget content = Column(
      children: [
        AppHeader(title: widget.titles[_selectedIndex]),
        Expanded(
          child: widget.screens[_selectedIndex],
        ),
      ],
    );

    if (isMobile) {
      return Scaffold(
        body: content,
        bottomNavigationBar: Container(
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppTheme.borderLight)),
          ),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (index) {
              if (index < widget.screens.length) {
                setState(() => _selectedIndex = index);
              }
            },
            type: BottomNavigationBarType.fixed,
            backgroundColor: AppTheme.surfaceWhite,
            selectedItemColor: AppTheme.primaryBlue,
            unselectedItemColor: AppTheme.textSecondary,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
            unselectedLabelStyle: const TextStyle(fontSize: 12),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.layoutDashboard, size: 20),
                label: 'Dashboard',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.terminal, size: 20),
                label: 'Playground',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.layers, size: 20),
                label: 'Fine-Tune',
              ),
              BottomNavigationBarItem(
                icon: Icon(LucideIcons.list, size: 20),
                label: 'Jobs',
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          SizedBox(
            width: 260,
            child: AppSidebar(
              selectedIndex: _selectedIndex,
              onItemSelected: (index) {
                if (index < widget.screens.length) {
                  setState(() => _selectedIndex = index);
                }
              },
            ),
          ),
          Expanded(
            child: content,
          ),
        ],
      ),
    );
  }
}
