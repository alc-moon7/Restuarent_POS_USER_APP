import 'package:flutter/material.dart';

import '../models/order_status.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    required this.label,
    required this.color,
    this.icon,
    super.key,
  });

  factory StatusBadge.order(OrderStatus status) {
    return StatusBadge(
      label: status.label,
      color: _statusColor(status),
      icon: status == OrderStatus.cancelled
          ? Icons.cancel_outlined
          : Icons.check_circle_outline,
    );
  }

  final String label;
  final Color color;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 5),
          ],
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  static Color _statusColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending:
        return AppColors.warning;
      case OrderStatus.accepted:
        return AppColors.primary;
      case OrderStatus.preparing:
        return const Color(0xFF2563EB);
      case OrderStatus.ready:
        return const Color(0xFF7C3AED);
      case OrderStatus.served:
        return AppColors.success;
      case OrderStatus.cancelled:
        return AppColors.danger;
    }
  }
}
