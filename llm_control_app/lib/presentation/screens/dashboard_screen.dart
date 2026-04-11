import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../logic/dashboard/dashboard_bloc.dart';
import '../widgets/dashboard/metric_card.dart';
import '../widgets/dashboard/loss_chart.dart';
import '../../core/theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        if (state is DashboardInitial) {
          context.read<DashboardBloc>().add(FetchDashboardData());
          return const Center(child: CircularProgressIndicator());
        }
        
        if (state is DashboardLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (state is DashboardLoaded) {
          final stats = state.stats;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionHeader('Key Performance Indicators'),
                const SizedBox(height: 24),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  crossAxisSpacing: 24,
                  mainAxisSpacing: 24,
                  childAspectRatio: 1.8,
                  children: [
                    MetricCard(
                      title: 'Active Jobs',
                      value: '${stats.activeJobs}',
                      icon: LucideIcons.activity,
                      iconColor: AppTheme.primaryBlue,
                      trend: '+12%',
                      isPositive: true,
                    ),
                    MetricCard(
                      title: 'Success Rate',
                      value: '${stats.averageAccuracy}%',
                      icon: LucideIcons.checkCircle,
                      iconColor: Colors.green,
                      trend: '+2.4%',
                      isPositive: true,
                    ),
                    MetricCard(
                      title: 'Total Models',
                      value: '${stats.totalJobs}',
                      icon: LucideIcons.database,
                      iconColor: AppTheme.accentOrange,
                      trend: '+5',
                      isPositive: true,
                    ),
                  ],
                ),
                const SizedBox(height: 40),
                _buildSectionHeader('Analytics Overview'),
                const SizedBox(height: 24),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 2,
                      child: LossChart(history: stats.lossHistory),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      child: _buildRecentActivity(),
                    ),
                  ],
                ),
              ],
            ),
          );
        }

        if (state is DashboardError) {
          return Center(child: Text('Error: ${state.message}'));
        }

        return const SizedBox();
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTheme.lightTheme.textTheme.titleMedium,
    );
  }

  Widget _buildRecentActivity() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'System Status',
              style: AppTheme.lightTheme.textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            _statusRow('API Endpoint', 'Connected', Colors.green),
            _statusRow('Inference Engine', 'Optimal', Colors.green),
            _statusRow('Database', 'Synced', Colors.green),
            _statusRow('Storage', '84% Free', AppTheme.primaryBlue),
          ],
        ),
      ),
    );
  }

  Widget _statusRow(String label, String status, Color statusColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textSecondary)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: statusColor,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
