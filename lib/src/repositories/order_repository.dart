import '../models/cart_item.dart';
import '../models/order_model.dart';
import '../models/server_config.dart';
import '../services/api_client_service.dart';

class OrderRepository {
  const OrderRepository(this._apiClient);

  final ApiClientService _apiClient;

  Future<OrderModel> createOrder({
    required ServerConfig config,
    required List<CartItem> items,
    String? customerName,
    String? tableNo,
    String? note,
  }) async {
    final response = await _apiClient.createOrder(config, {
      'customerName': _nullable(customerName),
      'tableNo': _nullable(tableNo),
      'note': _nullable(note),
      'items': items.map((item) => item.toOrderJson()).toList(growable: false),
    });
    final data = response['data'];
    if (data is! Map) {
      throw const ApiException('Order response was invalid.');
    }
    return OrderModel.fromJson(Map<String, Object?>.from(data));
  }

  Future<OrderModel?> fetchOrderById(
    ServerConfig config,
    String orderId,
  ) async {
    final rows = await _apiClient.getOrders(config);
    for (final row in rows) {
      final order = OrderModel.fromJson(row);
      if (order.id == orderId) return order;
    }
    return null;
  }

  String? _nullable(String? value) {
    final trimmed = value?.trim();
    if (trimmed == null || trimmed.isEmpty) return null;
    return trimmed;
  }
}
