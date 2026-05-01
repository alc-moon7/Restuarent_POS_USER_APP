import 'order_item.dart';
import 'order_status.dart';

class OrderModel {
  const OrderModel({
    required this.id,
    required this.orderNo,
    required this.status,
    required this.total,
    required this.items,
    required this.createdAt,
    this.customerName,
    this.tableNo,
    this.note,
  });

  final String id;
  final String orderNo;
  final OrderStatus status;
  final double total;
  final List<OrderItem> items;
  final DateTime createdAt;
  final String? customerName;
  final String? tableNo;
  final String? note;

  OrderModel copyWith({OrderStatus? status}) {
    return OrderModel(
      id: id,
      orderNo: orderNo,
      status: status ?? this.status,
      total: total,
      items: items,
      createdAt: createdAt,
      customerName: customerName,
      tableNo: tableNo,
      note: note,
    );
  }

  factory OrderModel.fromJson(Map<String, Object?> json) {
    final items = json['items'];
    return OrderModel(
      id: json['id']?.toString() ?? '',
      orderNo: json['orderNo']?.toString() ?? '',
      status: OrderStatus.parse(json['status']?.toString()),
      total: (json['total'] as num?)?.toDouble() ?? 0,
      items: items is List
          ? items
                .whereType<Map>()
                .map(
                  (item) => OrderItem.fromJson(Map<String, Object?>.from(item)),
                )
                .toList(growable: false)
          : const [],
      createdAt:
          DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      customerName: _nullable(json['customerName']?.toString()),
      tableNo: _nullable(json['tableNo']?.toString()),
      note: _nullable(json['note']?.toString()),
    );
  }

  Map<String, Object?> toJson() {
    return {
      'id': id,
      'orderNo': orderNo,
      'status': status.value,
      'total': total,
      'items': items.map((item) => item.toJson()).toList(growable: false),
      'createdAt': createdAt.toIso8601String(),
      'customerName': customerName,
      'tableNo': tableNo,
      'note': note,
    };
  }

  static String? _nullable(String? value) {
    final trimmed = value?.trim();
    if (trimmed == null || trimmed.isEmpty) return null;
    return trimmed;
  }
}
