import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'primary_button.dart';

class ErrorView extends StatelessWidget {
  const ErrorView({required this.message, this.onRetry, super.key});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.wifi_off_outlined, color: AppColors.danger),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Could not load',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(message, style: Theme.of(context).textTheme.bodyMedium),
                  if (onRetry != null) ...[
                    const SizedBox(height: 12),
                    PrimaryButton(
                      label: 'Retry',
                      icon: Icons.refresh,
                      secondary: true,
                      onPressed: onRetry,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
