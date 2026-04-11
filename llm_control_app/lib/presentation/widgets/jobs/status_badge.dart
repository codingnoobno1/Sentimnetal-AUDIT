import 'package:flutter/material.dart';
import '../../../core/theme.dart';
import '../../../data/models/job_model.dart';

class StatusBadge extends StatelessWidget {
  final JobStatus status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String text;

    switch (status) {
      case JobStatus.completed:
        color = Colors.green;
        text = 'Completed';
        break;
      case JobStatus.training:
        color = AppTheme.primaryBlue;
        text = 'Training';
        break;
      case JobStatus.failed:
        color = Colors.red;
        text = 'Failed';
        break;
      case JobStatus.pending:
        color = AppTheme.accentOrange;
        text = 'Pending';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
