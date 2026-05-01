class ServerConfig {
  const ServerConfig({
    required this.ip,
    required this.port,
    this.secure = false,
  });

  final String ip;
  final int port;
  final bool secure;

  String get baseUrl => '${secure ? 'https' : 'http'}://$ip:$port';
  String get webSocketUrl => '${secure ? 'wss' : 'ws'}://$ip:$port/ws';

  bool get isValid => ip.trim().isNotEmpty && port > 0 && port <= 65535;

  Map<String, Object?> toJson() => {'ip': ip, 'port': port, 'secure': secure};

  factory ServerConfig.fromInput({
    required String address,
    required String port,
    required bool secure,
  }) {
    final trimmedAddress = address.trim();
    final normalizedAddress = trimmedAddress.contains('://')
        ? trimmedAddress
        : '${secure ? 'https' : 'http'}://$trimmedAddress';
    final uri = Uri.tryParse(normalizedAddress);
    final parsedPort = uri?.hasPort == true
        ? uri!.port
        : int.tryParse(port.trim());

    var parsedSecure = secure;
    if (uri != null) {
      parsedSecure = switch (uri.scheme) {
        'https' || 'wss' => true,
        'http' || 'ws' => false,
        _ => secure,
      };
    }

    return ServerConfig(
      ip: uri?.host.isNotEmpty == true ? uri!.host : trimmedAddress,
      port: parsedPort ?? (parsedSecure ? 443 : 8080),
      secure: parsedSecure,
    );
  }

  factory ServerConfig.fromJson(Map<String, Object?> json) {
    return ServerConfig(
      ip: json['ip']?.toString() ?? '',
      port: int.tryParse(json['port']?.toString() ?? '') ?? 8080,
      secure:
          json['secure'] == true ||
          json['scheme']?.toString().toLowerCase() == 'https',
    );
  }
}
