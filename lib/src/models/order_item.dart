class OrderItem {
  const OrderItem({
    required this.id,
    required this.menuItemId,
    required this.name,
    required this.qty,
    required this.price,
    required this.lineTotal,
  });

  final String id;
  final String menuItemId;
  final String name;
  final int qty;
  final double price;
  final double lineTotal;

  factory OrderItem.fromJson(Map<String, Object?> json) {
    final qty = (json['qty'] as num?)?.toInt() ?? 0;
    final price = (json['price'] as num?)?.toDouble() ?? 0;
    return OrderItem(
      id: json['id']?.toString() ?? '',
      menuItemId: json['menuItemId']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Item',
      qty: qty,
      price: price,
      lineTotal: (json['lineTotal'] as num?)?.toDouble() ?? price * qty,
    );
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'menuItemId': menuItemId,
      'name': name,
      'qty': qty,
      'price': price,
      'lineTotal': lineTotal,
    };
  }
}
