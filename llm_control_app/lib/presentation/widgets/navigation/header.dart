import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme.dart';

class AppHeader extends StatelessWidget {
  final String title;

  const AppHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool showUserDetails = width > 600;
    final bool showActions = width > 450;

    return Container(
      height: 70,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        color: AppTheme.surfaceWhite,
        border: Border(bottom: BorderSide(color: AppTheme.borderLight)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              overflow: TextOverflow.ellipsis,
              style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                fontSize: 18,
              ),
            ),
          ),
          if (showActions) const SizedBox(width: 16),
          if (showActions) _buildActionButton(LucideIcons.search),
          if (showActions) const SizedBox(width: 8),
          if (showActions) _buildActionButton(LucideIcons.bell),
          if (showActions) const SizedBox(width: 16),
          if (showActions)
            const VerticalDivider(
              indent: 20,
              endIndent: 20,
              color: AppTheme.borderLight,
            ),
          const SizedBox(width: 16),
          _buildUserProfile(showUserDetails),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon) {
    return IconButton(
      icon: Icon(icon, size: 20, color: AppTheme.textSecondary),
      onPressed: () {},
      splashRadius: 24,
    );
  }

  Widget _buildUserProfile(bool showDetails) {
    return Row(
      children: [
        if (showDetails)
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Tushar Gupta',
                style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              Text(
                'Admin Account',
                style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                  fontSize: 12,
                ),
              ),
            ],
          ),
        if (showDetails) const SizedBox(width: 12),
        const CircleAvatar(
          radius: 18,
          backgroundColor: AppTheme.primaryBlue,
          child: Text(
            'TG',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}
