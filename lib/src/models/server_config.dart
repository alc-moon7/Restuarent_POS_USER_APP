class ServerConfig {
  const ServerConfig({required this.ip, required this.port});

  final String ip;
  final int port;

  String get baseUrl => 'http://$ip:$port';
  String get webSocketUrl => 'ws://$ip:$port/ws';

  bool get isValid => ip.trim().isNotEmpty && port > 0 && port <= 65535;

  Map<String, Object?> toJson() => {'ip': ip, 'port': port};

  factory ServerConfig.fromJson(Map<String, Object?> json) {
    return ServerConfig(
      ip: json['ip']?.toString() ?? '',
      port: int.tryParse(json['port']?.toString() ?? '') ?? 8080,
    );
  }
}
