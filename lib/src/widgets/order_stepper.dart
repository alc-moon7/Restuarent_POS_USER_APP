import 'package:flutter/material.dart';

import '../models/order_status.dart';
import '../theme/app_theme.dart';

class OrderStepper extends StatelessWidget {
  const OrderStepper({required this.status, super.key});

  final OrderStatus status;

  static const List<OrderStatus> _steps = [
    OrderStatus.pending,
    OrderStatus.accepted,
    OrderStatus.preparing,
    OrderStatus.ready,
    OrderStatus.served,
  ];

  @override
  Widget build(BuildContext context) {
    final currentIndex = status.progressIndex;
    if (status == OrderStatus.cancelled) {
      return const _CancelledStep();
    }
    return Column(
      children: [
        for (var i = 0; i < _steps.length; i++)
          _StepRow(
            status: _steps[i],
            active: i <= currentIndex,
            last: i == _steps.length - 1,
          ),
      ],
    );
  }
}

class _StepRow extends StatelessWidget {
  const _StepRow({
    required this.status,
    required this.active,
    required this.last,
  });

  final OrderStatus status;
  final bool active;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.line;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: active ? AppColors.primary : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: color, width: 2),
              ),
              child: active
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : null,
            ),
            if (!last)
              Container(
                width: 2,
                height: 38,
                color: color.withValues(alpha: active ? 1 : 0.7),
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              status.label,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: active ? AppColors.slate : AppColors.muted,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _CancelledStep extends StatelessWidget {
  const _CancelledStep();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.danger.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.cancel_outlined, color: AppColors.danger),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'This order was cancelled.',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );
  }
}
