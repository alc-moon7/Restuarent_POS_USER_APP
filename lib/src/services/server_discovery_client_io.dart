import 'dart:async';
import 'dart:convert';
import 'dart:io';

import '../models/server_config.dart';

class ServerDiscoveryClient {
  ServerDiscoveryClient({this.discoveryPort = 45678});

  final int discoveryPort;
  RawDatagramSocket? _socket;
  StreamSubscription<RawSocketEvent>? _subscription;

  Future<ServerConfig?> findServer({
    Duration timeout = const Duration(seconds: 5),
  }) async {
    await _closeSocket();
    final completer = Completer<ServerConfig?>();

    try {
      _socket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        discoveryPort,
        reuseAddress: true,
      );
      _subscription = _socket!.listen((event) {
        if (event != RawSocketEvent.read || completer.isCompleted) return;
        Datagram? datagram;
        while ((datagram = _socket!.receive()) != null) {
          final config = _configFromDatagram(datagram!);
          if (config == null) continue;
          completer.complete(config);
          break;
        }
      });
    } on SocketException {
      return null;
    }

    final timer = Timer(timeout, () {
      if (!completer.isCompleted) completer.complete(null);
    });

    try {
      return await completer.future;
    } finally {
      timer.cancel();
      await _closeSocket();
    }
  }

  void dispose() {
    unawaited(_closeSocket());
  }

  ServerConfig? _configFromDatagram(Datagram datagram) {
    try {
      final decoded = jsonDecode(utf8.decode(datagram.data));
      if (decoded is! Map) return null;
      final json = Map<String, Object?>.from(decoded);
      if (json['type'] != 'POS_SERVER_ADVERTISEMENT') return null;

      final port = int.tryParse(json['port']?.toString() ?? '');
      if (port == null || port <= 0 || port > 65535) return null;

      final localIp = json['localIp']?.toString().trim();
      if (localIp != null && localIp.isNotEmpty) {
        return ServerConfig(ip: localIp, port: port);
      }

      final baseUrl = json['baseUrl']?.toString().trim();
      if (baseUrl == null || baseUrl.isEmpty) return null;
      return ServerConfig.fromInput(
        address: baseUrl,
        port: port.toString(),
        secure: false,
      );
    } on FormatException {
      return null;
    } on Object {
      return null;
    }
  }

  Future<void> _closeSocket() async {
    await _subscription?.cancel();
    _subscription = null;
    _socket?.close();
    _socket = null;
  }
}
