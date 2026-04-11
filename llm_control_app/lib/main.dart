import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';

import 'core/theme.dart';
import 'data/repositories/llm_repository.dart';
import 'data/services/api_service.dart';
import 'logic/dashboard/dashboard_bloc.dart';
import 'logic/fine_tune/fine_tune_bloc.dart';
import 'logic/inference/inference_bloc.dart';
import 'logic/job/job_bloc.dart';
import 'logic/model_manager/model_manager_bloc.dart';
import 'logic/prompt/prompt_bloc.dart';
import 'presentation/screens/dashboard_screen.dart';
import 'presentation/screens/fine_tune_screen.dart';
import 'presentation/screens/jobs_screen.dart';
import 'presentation/screens/model_manager_screen.dart';
import 'presentation/screens/playground_screen.dart';
import 'presentation/widgets/layout/main_scaffold.dart';

import 'presentation/screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Shared API and Repository instances
    final apiService = ApiService();
    final repository = LlmRepository(apiService);

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: repository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => DashboardBloc(repository)),
          BlocProvider(create: (context) => PromptBloc(repository)),
          BlocProvider(create: (context) => FineTuneBloc(repository)),
          BlocProvider(create: (context) => JobBloc(repository)),
          BlocProvider(create: (context) => ModelManagerBloc(repository)),
          BlocProvider(create: (context) => InferenceBloc(repository)),
        ],
        child: MaterialApp(
          title: 'SENTINEL LLM Control Panel',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          home: SplashScreen(
            nextScreen: const MainScaffold(
              screens: [
                DashboardScreen(),
                PlaygroundScreen(),
                ModelManagerScreen(),
                FineTuneScreen(),
                JobsScreen(),
              ],
              titles: [
                'System Dashboard',
                'LLM Playground',
                'Model Storage',
                'Fine-Tuning Configuration',
                'Job Monitoring History',
              ],
            ),
          ),
        ),
      ),
    );
  }
}
