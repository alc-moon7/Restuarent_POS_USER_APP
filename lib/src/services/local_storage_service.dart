import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/order_model.dart';
import '../models/server_config.dart';

class LocalStorageService {
  Future<ServerConfig?> loadServerConfig() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_serverConfigKey);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      return ServerConfig.fromJson(Map<String, Object?>.from(decoded));
    } on FormatException {
      await prefs.remove(_serverConfigKey);
      return null;
    }
  }

  Future<void> saveServerConfig(ServerConfig config) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_serverConfigKey, jsonEncode(config.toJson()));
  }

  Future<OrderModel?> loadCurrentOrder() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_currentOrderKey);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      return OrderModel.fromJson(Map<String, Object?>.from(decoded));
    } on FormatException {
      await prefs.remove(_currentOrderKey);
      return null;
    }
  }

  Future<void> saveCurrentOrder(OrderModel order) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_currentOrderKey, jsonEncode(order.toJson()));
  }

  Future<void> clearCurrentOrder() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_currentOrderKey);
  }

  static const String _serverConfigKey = 'customer_server_config';
  static const String _currentOrderKey = 'customer_current_order';
}
