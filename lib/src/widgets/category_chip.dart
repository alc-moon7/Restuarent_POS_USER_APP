import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class CategoryChip extends StatelessWidget {
  const CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
    super.key,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: AppColors.primary.withValues(alpha: 0.13),
      side: BorderSide(color: selected ? AppColors.primary : AppColors.line),
      labelStyle: TextStyle(
        color: selected ? AppColors.primary : AppColors.slate,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}
