import 'menu_item.dart';

class CartItem {
  const CartItem({required this.menuItem, required this.qty});

  final MenuItem menuItem;
  final int qty;

  double get lineTotal => menuItem.price * qty;

  CartItem copyWith({int? qty}) {
    return CartItem(menuItem: menuItem, qty: qty ?? this.qty);
  }

  Map<String, Object?> toOrderJson() {
    return {
      'menuItemId': menuItem.id,
      'name': menuItem.name,
      'qty': qty,
      'price': menuItem.price,
    };
  }
}
