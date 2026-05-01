import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../app_scope.dart';
import '../theme/app_theme.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/cart_item_tile.dart';
import '../widgets/empty_state.dart';
import '../widgets/primary_button.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _tableController = TextEditingController();
  final _noteController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _tableController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = AppScope.of(context);
    final currency = NumberFormat.currency(symbol: r'$', decimalDigits: 2);
    return AppScaffold(
      title: 'Cart',
      subtitle: 'Review items and place your order.',
      actions: [
        PrimaryButton(
          label: 'Menu',
          icon: Icons.restaurant_menu,
          secondary: true,
          onPressed: () => Navigator.pop(context),
        ),
      ],
      child: app.cartItems.isEmpty
          ? EmptyState(
              title: 'Cart is empty',
              message: 'Add items from the menu before placing an order.',
              icon: Icons.shopping_bag_outlined,
              action: PrimaryButton(
                label: 'Browse Menu',
                icon: Icons.restaurant_menu,
                onPressed: () => Navigator.pop(context),
              ),
            )
          : Form(
              key: _formKey,
              child: Column(
                children: [
                  for (final item in app.cartItems)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: CartItemTile(
                        item: item,
                        onIncrease: () =>
                            app.increaseCartItem(item.menuItem.id),
                        onDecrease: () =>
                            app.decreaseCartItem(item.menuItem.id),
                        onRemove: () => app.removeCartItem(item.menuItem.id),
                      ),
                    ),
                  const SizedBox(height: 6),
                  _OrderForm(
                    nameController: _nameController,
                    tableController: _tableController,
                    noteController: _noteController,
                  ),
                  const SizedBox(height: 12),
                  _TotalCard(
                    total: currency.format(app.cartTotal),
                    loading: app.placingOrder,
                    onPlaceOrder: () => _placeOrder(app),
                  ),
                  if (app.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      app.errorMessage!,
                      style: const TextStyle(
                        color: AppColors.danger,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Future<void> _placeOrder(dynamic app) async {
    if (!_formKey.currentState!.validate()) return;
    final order = await app.placeOrder(
      customerName: _nameController.text,
      tableNo: _tableController.text,
      note: _noteController.text,
    );
    if (!mounted || order == null) return;
    Navigator.pushReplacementNamed(context, '/tracking');
  }
}

class _OrderForm extends StatelessWidget {
  const _OrderForm({
    required this.nameController,
    required this.tableController,
    required this.noteController,
  });

  final TextEditingController nameController;
  final TextEditingController tableController;
  final TextEditingController noteController;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            TextFormField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Customer name',
                hintText: 'Optional',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: tableController,
              decoration: const InputDecoration(
                labelText: 'Table number',
                prefixIcon: Icon(Icons.table_restaurant_outlined),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Table number is required';
                }
                return null;
              },
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: noteController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Order note',
                hintText: 'Optional',
                prefixIcon: Icon(Icons.sticky_note_2_outlined),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TotalCard extends StatelessWidget {
  const _TotalCard({
    required this.total,
    required this.loading,
    required this.onPlaceOrder,
  });

  final String total;
  final bool loading;
  final VoidCallback onPlaceOrder;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Total', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 2),
                  Text(
                    total,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            PrimaryButton(
              label: 'Place Order',
              icon: Icons.send_outlined,
              loading: loading,
              onPressed: onPlaceOrder,
            ),
          ],
        ),
      ),
    );
  }
}
