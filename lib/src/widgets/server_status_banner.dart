import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class ServerStatusBanner extends StatelessWidget {
  const ServerStatusBanner({
    required this.connected,
    required this.message,
    this.onReconnect,
    super.key,
  });

  final bool connected;
  final String message;
  final VoidCallback? onReconnect;

  @override
  Widget build(BuildContext context) {
    final color = connected ? AppColors.success : AppColors.warning;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.24)),
      ),
      child: Row(
        children: [
          Icon(connected ? Icons.wifi : Icons.wifi_off, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: color, fontWeight: FontWeight.w800),
            ),
          ),
          if (!connected && onReconnect != null)
            TextButton(onPressed: onReconnect, child: const Text('Reconnect')),
        ],
      ),
    );
  }
}
