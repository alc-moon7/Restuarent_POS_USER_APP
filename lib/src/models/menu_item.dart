class MenuItem {
  const MenuItem({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.isAvailable,
    this.imageUrl,
    this.preparationTimeMinutes,
    this.tags = const [],
  });

  final String id;
  final String name;
  final String description;
  final String category;
  final double price;
  final bool isAvailable;
  final String? imageUrl;
  final int? preparationTimeMinutes;
  final List<String> tags;

  factory MenuItem.fromJson(Map<String, Object?> json) {
    final tags = json['tags'];
    return MenuItem(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Menu item',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Menu',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      isAvailable: json['isAvailable'] == true,
      imageUrl: _nullable(json['imageUrl']?.toString()),
      preparationTimeMinutes: int.tryParse(
        json['preparationTimeMinutes']?.toString() ?? '',
      ),
      tags: tags is List
          ? tags.map((tag) => tag.toString()).toList(growable: false)
          : const [],
    );
  }

  static String? _nullable(String? value) {
    final trimmed = value?.trim();
    if (trimmed == null || trimmed.isEmpty) return null;
    return trimmed;
  }
}
