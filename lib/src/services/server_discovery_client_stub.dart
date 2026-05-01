import '../models/server_config.dart';

class ServerDiscoveryClient {
  Future<ServerConfig?> findServer({
    Duration timeout = const Duration(seconds: 5),
  }) async {
    return null;
  }

  void dispose() {}
}
