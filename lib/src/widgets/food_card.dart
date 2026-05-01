import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/menu_item.dart';
import '../theme/app_theme.dart';
import 'primary_button.dart';
import 'status_badge.dart';

class FoodCard extends StatelessWidget {
  const FoodCard({required this.item, required this.onAdd, super.key});

  final MenuItem item;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: r'$', decimalDigits: 2);
    return Card(
      child: Opacity(
        opacity: item.isAvailable ? 1 : 0.58,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AspectRatio(
                  aspectRatio: 1.55,
                  child: item.imageUrl == null
                      ? _FoodPlaceholder(category: item.category)
                      : Image.network(
                          item.imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return _FoodPlaceholder(category: item.category);
                          },
                        ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      item.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    currency.format(item.price),
                    style: Theme.of(
                      context,
                    ).textTheme.titleMedium?.copyWith(color: AppColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              Text(
                item.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Spacer(),
              const SizedBox(height: 10),
              Wrap(
                spacing: 7,
                runSpacing: 7,
                children: [
                  StatusBadge(
                    label: item.isAvailable ? 'Available' : 'Unavailable',
                    color: item.isAvailable
                        ? AppColors.success
                        : AppColors.danger,
                    icon: item.isAvailable
                        ? Icons.check_circle_outline
                        : Icons.pause_circle_outline,
                  ),
                  StatusBadge(
                    label: item.category,
                    color: AppColors.accent,
                    icon: Icons.restaurant_menu,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: PrimaryButton(
                  label: item.isAvailable ? 'Add' : 'Unavailable',
                  icon: Icons.add_shopping_cart,
                  onPressed: item.isAvailable ? onAdd : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FoodPlaceholder extends StatelessWidget {
  const _FoodPlaceholder({required this.category});

  final String category;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFEDD5), Color(0xFFD1FAE5)],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.restaurant, color: AppColors.primary, size: 34),
            const SizedBox(height: 8),
            Text(
              category,
              style: const TextStyle(
                color: AppColors.primaryDark,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
