import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../models/server_config.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClientService {
  ApiClientService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  static const Duration _timeout = Duration(seconds: 7);

  Future<Map<String, Object?>> getHealth(ServerConfig config) {
    return _getJson(Uri.parse('${config.baseUrl}/health'));
  }

  Future<List<Map<String, Object?>>> getMenu(ServerConfig config) async {
    final json = await _getJson(Uri.parse('${config.baseUrl}/menu'));
    final data = json['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((item) => Map<String, Object?>.from(item))
        .toList(growable: false);
  }

  Future<Map<String, Object?>> createOrder(
    ServerConfig config,
    Map<String, Object?> payload,
  ) {
    return _requestJson(
      () => _client
          .post(
            Uri.parse('${config.baseUrl}/orders'),
            headers: const {
              HttpHeaders.contentTypeHeader: 'application/json',
              HttpHeaders.acceptHeader: 'application/json',
            },
            body: jsonEncode(payload),
          )
          .timeout(_timeout),
    );
  }

  Future<List<Map<String, Object?>>> getOrders(ServerConfig config) async {
    final json = await _getJson(Uri.parse('${config.baseUrl}/orders'));
    final data = json['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((item) => Map<String, Object?>.from(item))
        .toList(growable: false);
  }

  Future<Map<String, Object?>> _getJson(Uri uri) {
    return _requestJson(() => _client.get(uri).timeout(_timeout));
  }

  Future<Map<String, Object?>> _requestJson(
    Future<http.Response> Function() request,
  ) async {
    try {
      final response = await request();
      final decoded = response.body.trim().isEmpty
          ? <String, Object?>{}
          : jsonDecode(response.body);
      final json = decoded is Map
          ? Map<String, Object?>.from(decoded)
          : <String, Object?>{'data': decoded};

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiException(
          json['error']?.toString() ??
              'Server returned ${response.statusCode}.',
          statusCode: response.statusCode,
        );
      }
      if (json['ok'] == false) {
        throw ApiException(json['error']?.toString() ?? 'Request failed.');
      }
      return json;
    } on ApiException {
      rethrow;
    } on SocketException {
      throw const ApiException(
        'Server unreachable. Check WiFi, IP address, and that Admin server is running.',
      );
    } on FormatException {
      throw const ApiException('Server returned invalid JSON.');
    } on http.ClientException {
      throw const ApiException('Could not connect to the Admin server.');
    } on Object {
      throw const ApiException('Request timed out or server is offline.');
    }
  }

  void close() => _client.close();
}
