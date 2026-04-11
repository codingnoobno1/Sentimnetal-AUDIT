import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../logic/job/job_bloc.dart';
import '../widgets/jobs/job_grid.dart';
import '../../core/theme.dart';

class JobsScreen extends StatelessWidget {
  const JobsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<JobBloc, JobState>(
      builder: (context, state) {
        if (state is JobInitial) {
          context.read<JobBloc>().add(FetchJobs());
          return const Center(child: CircularProgressIndicator());
        }

        if (state is JobLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (state is JobsLoaded) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(32, 32, 32, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Training Job History',
                      style: AppTheme.lightTheme.textTheme.titleMedium,
                    ),
                    OutlinedButton.icon(
                      onPressed: () => context.read<JobBloc>().add(FetchJobs()),
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Refresh'),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(32),
                  child: JobGrid(jobs: state.jobs),
                ),
              ),
            ],
          );
        }

        if (state is JobError) {
          return Center(child: Text('Error: ${state.message}'));
        }

        return const SizedBox();
      },
    );
  }
}
