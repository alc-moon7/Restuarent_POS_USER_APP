import '../models/menu_item.dart';
import '../models/server_config.dart';
import '../services/api_client_service.dart';

class MenuRepository {
  const MenuRepository(this._apiClient);

  final ApiClientService _apiClient;

  Future<List<MenuItem>> fetchMenu(ServerConfig config) async {
    final rows = await _apiClient.getMenu(config);
    return rows.map(MenuItem.fromJson).toList(growable: false);
  }
}
