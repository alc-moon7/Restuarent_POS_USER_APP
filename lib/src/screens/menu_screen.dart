import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../app_scope.dart';
import '../models/menu_item.dart';
import '../theme/app_theme.dart';
import '../widgets/app_scaffold.dart';
import '../widgets/category_chip.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_view.dart';
import '../widgets/food_card.dart';
import '../widgets/loading_view.dart';
import '../widgets/primary_button.dart';
import '../widgets/server_status_banner.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final _searchController = TextEditingController();
  String _category = 'All';
  bool _loadedOnce = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loadedOnce) return;
    _loadedOnce = true;
    final app = AppScope.of(context);
    if (!app.hasServer) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.pushReplacementNamed(context, '/connect');
      });
      return;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => app.loadMenu());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = AppScope.of(context);
    final categories = ['All', ..._categories(app.menuItems)];
    if (!categories.contains(_category)) _category = 'All';
    final items = _filteredItems(app.menuItems);
    final currency = NumberFormat.currency(symbol: r'$', decimalDigits: 2);

    return AppScaffold(
      title: 'Menu',
      subtitle: app.serverConfig == null
          ? 'Connect to a restaurant server'
          : app.serverConfig!.baseUrl,
      actions: [
        PrimaryButton(
          label: 'Cart (${app.cartCount})',
          icon: Icons.shopping_bag_outlined,
          secondary: true,
          onPressed: () => Navigator.pushNamed(context, '/cart'),
        ),
        if (app.currentOrder != null)
          PrimaryButton(
            label: 'Track',
            icon: Icons.receipt_long,
            secondary: true,
            onPressed: () => Navigator.pushNamed(context, '/tracking'),
          ),
      ],
      bottomNavigationBar: app.cartCount == 0
          ? null
          : _CartSummary(
              label: '${app.cartCount} item${app.cartCount == 1 ? '' : 's'}',
              total: currency.format(app.cartTotal),
              onTap: () => Navigator.pushNamed(context, '/cart'),
            ),
      child: Column(
        children: [
          ServerStatusBanner(
            connected: app.errorMessage == null,
            message: app.errorMessage == null
                ? 'Connected to the restaurant menu'
                : app.errorMessage!,
            onReconnect: app.loadMenu,
          ),
          const SizedBox(height: 12),
          _MenuFilters(
            searchController: _searchController,
            categories: categories,
            selectedCategory: _category,
            onChanged: () => setState(() {}),
            onCategoryTap: (category) => setState(() => _category = category),
          ),
          const SizedBox(height: 14),
          if (app.menuLoading)
            const LoadingView(message: 'Loading fresh menu...')
          else if (app.errorMessage != null && app.menuItems.isEmpty)
            ErrorView(message: app.errorMessage!, onRetry: app.loadMenu)
          else
            RefreshIndicator(
              onRefresh: app.loadMenu,
              child: items.isEmpty
                  ? ListView(
                      shrinkWrap: true,
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        EmptyState(
                          title: 'No menu items found',
                          message:
                              'Try another search or ask staff to refresh the menu.',
                          icon: Icons.restaurant_menu,
                        ),
                      ],
                    )
                  : _FoodGrid(
                      items: items,
                      onAdd: (item) {
                        app.addToCart(item);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${item.name} added')),
                        );
                      },
                    ),
            ),
        ],
      ),
    );
  }

  List<String> _categories(List<MenuItem> items) {
    final values = items.map((item) => item.category).toSet().toList()
      ..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));
    return values;
  }

  List<MenuItem> _filteredItems(List<MenuItem> items) {
    final query = _searchController.text.trim().toLowerCase();
    return items
        .where((item) {
          final categoryMatches =
              _category == 'All' || item.category == _category;
          final searchMatches =
              query.isEmpty ||
              item.name.toLowerCase().contains(query) ||
              item.description.toLowerCase().contains(query) ||
              item.category.toLowerCase().contains(query);
          return categoryMatches && searchMatches;
        })
        .toList(growable: false);
  }
}

class _MenuFilters extends StatelessWidget {
  const _MenuFilters({
    required this.searchController,
    required this.categories,
    required this.selectedCategory,
    required this.onChanged,
    required this.onCategoryTap,
  });

  final TextEditingController searchController;
  final List<String> categories;
  final String selectedCategory;
  final VoidCallback onChanged;
  final ValueChanged<String> onCategoryTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              controller: searchController,
              onChanged: (_) => onChanged(),
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Search food, drinks, categories',
              ),
            ),
            const SizedBox(height: 10),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final category in categories)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: CategoryChip(
                        label: category,
                        selected: selectedCategory == category,
                        onTap: () => onCategoryTap(category),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FoodGrid extends StatelessWidget {
  const _FoodGrid({required this.items, required this.onAdd});

  final List<MenuItem> items;
  final ValueChanged<MenuItem> onAdd;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final columns = width >= 1050
            ? 3
            : width >= 680
            ? 2
            : 1;
        return GridView.builder(
          shrinkWrap: true,
          physics: const AlwaysScrollableScrollPhysics(),
          itemCount: items.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: columns == 1 ? 0.94 : 0.82,
          ),
          itemBuilder: (context, index) {
            final item = items[index];
            return FoodCard(item: item, onAdd: () => onAdd(item));
          },
        );
      },
    );
  }
}

class _CartSummary extends StatelessWidget {
  const _CartSummary({
    required this.label,
    required this.total,
    required this.onTap,
  });

  final String label;
  final String total;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
        child: Material(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(20),
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  const Icon(Icons.shopping_bag_outlined, color: Colors.white),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  Text(
                    total,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
