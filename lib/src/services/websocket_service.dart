import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../models/server_config.dart';

class WebSocketEvent {
  const WebSocketEvent({required this.type, required this.data});

  final String type;
  final Map<String, Object?> data;
}

class CustomerWebSocketService {
  final StreamController<WebSocketEvent> _eventController =
      StreamController<WebSocketEvent>.broadcast();
  final StreamController<bool> _connectionController =
      StreamController<bool>.broadcast();

  WebSocketChannel? _channel;
  ServerConfig? _config;
  Timer? _reconnectTimer;
  var _attempt = 0;
  var _disposed = false;
  var _manualDisconnect = false;

  Stream<WebSocketEvent> get events => _eventController.stream;
  Stream<bool> get connectionChanges => _connectionController.stream;

  void connect(ServerConfig config) {
    _config = config;
    _manualDisconnect = false;
    _open();
  }

  void disconnect() {
    _manualDisconnect = true;
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    _emitConnection(false);
  }

  void _open() {
    if (_disposed || _config == null) return;
    _reconnectTimer?.cancel();
    try {
      final channel = WebSocketChannel.connect(
        Uri.parse(_config!.webSocketUrl),
      );
      _channel = channel;
      _attempt = 0;
      _emitConnection(true);
      channel.stream.listen(
        _handleMessage,
        onDone: _handleDisconnect,
        onError: (_) => _handleDisconnect(),
        cancelOnError: true,
      );
    } catch (_) {
      _handleDisconnect();
    }
  }

  void _handleMessage(Object? raw) {
    if (raw is! String) return;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return;
      final json = Map<String, Object?>.from(decoded);
      final data = json['data'];
      if (data is! Map) return;
      _eventController.add(
        WebSocketEvent(
          type: json['type']?.toString() ?? '',
          data: Map<String, Object?>.from(data),
        ),
      );
    } catch (_) {
      return;
    }
  }

  void _handleDisconnect() {
    _channel = null;
    _emitConnection(false);
    if (_disposed || _manualDisconnect || _config == null) return;

    final seconds = (1 << _attempt).clamp(1, 16).toInt();
    _attempt = (_attempt + 1).clamp(0, 4).toInt();
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(seconds: seconds), _open);
  }

  void _emitConnection(bool connected) {
    if (!_connectionController.isClosed) {
      _connectionController.add(connected);
    }
  }

  Future<void> dispose() async {
    _disposed = true;
    _manualDisconnect = true;
    _reconnectTimer?.cancel();
    await _channel?.sink.close();
    await _eventController.close();
    await _connectionController.close();
  }
}
