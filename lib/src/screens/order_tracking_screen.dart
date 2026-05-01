import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../app_scope.dart';
import '../models/order_status.dart';
import '../theme/app_theme.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/empty_state.dart';
import '../widgets/order_stepper.dart';
import '../widgets/primary_button.dart';
import '../widgets/server_status_banner.dart';
import '../widgets/status_badge.dart';

class OrderTrackingScreen extends StatefulWidget {
  const OrderTrackingScreen({super.key});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final app = AppScope.of(context);
      app.reconnectWebSocket();
      app.refreshCurrentOrder();
    });
  }

  @override
  Widget build(BuildContext context) {
    final app = AppScope.of(context);
    final order = app.currentOrder;
    if (order == null) {
      return AppScaffold(
        title: 'Track Order',
        child: EmptyState(
          title: 'No active order',
          message: 'Place an order first and it will appear here.',
          icon: Icons.receipt_long_outlined,
          action: PrimaryButton(
            label: 'Back to Menu',
            icon: Icons.restaurant_menu,
            onPressed: () => Navigator.pushReplacementNamed(context, '/menu'),
          ),
        ),
      );
    }

    final currency = NumberFormat.currency(symbol: r'$', decimalDigits: 2);
    return AppScaffold(
      title: 'Track Order',
      subtitle: order.orderNo.isEmpty ? order.id : order.orderNo,
      actions: [
        PrimaryButton(
          label: 'Refresh',
          icon: Icons.refresh,
          secondary: true,
          onPressed: app.refreshCurrentOrder,
        ),
        PrimaryButton(
          label: 'Menu',
          icon: Icons.restaurant_menu,
          secondary: true,
          onPressed: () => Navigator.pushReplacementNamed(context, '/menu'),
        ),
      ],
      child: Column(
        children: [
          ServerStatusBanner(
            connected: app.webSocketConnected,
            message: app.webSocketConnected
                ? 'Live updates connected'
                : 'Live updates disconnected. We will keep trying.',
            onReconnect: app.reconnectWebSocket,
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Order progress',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ),
                      StatusBadge.order(order.status),
                    ],
                  ),
                  const SizedBox(height: 18),
                  OrderStepper(status: order.status),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order summary',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  for (final item in order.items)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          Expanded(child: Text('${item.qty}x ${item.name}')),
                          Text(currency.format(item.lineTotal)),
                        ],
                      ),
                    ),
                  const Divider(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Total',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      Text(
                        currency.format(order.total),
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                  if (order.tableNo != null) ...[
                    const SizedBox(height: 8),
                    Text('Table: ${order.tableNo}'),
                  ],
                ],
              ),
            ),
          ),
          if (order.status == OrderStatus.served) ...[
            const SizedBox(height: 12),
            PrimaryButton(
              label: 'Finish',
              icon: Icons.done_all,
              onPressed: () async {
                await app.clearOrder();
                if (!context.mounted) return;
                Navigator.pushReplacementNamed(context, '/menu');
              },
            ),
          ],
        ],
      ),
    );
  }
}
