import 'dart:async';

import 'package:flutter/foundation.dart';

import 'models/cart_item.dart';
import 'models/menu_item.dart';
import 'models/order_model.dart';
import 'models/server_config.dart';
import 'repositories/menu_repository.dart';
import 'repositories/order_repository.dart';
import 'services/api_client_service.dart';
import 'services/local_storage_service.dart';
import 'services/server_discovery_client.dart';
import 'services/websocket_service.dart';

class CustomerAppController extends ChangeNotifier {
  CustomerAppController({
    ApiClientService? apiClient,
    LocalStorageService? storage,
    ServerDiscoveryClient? discoveryClient,
    CustomerWebSocketService? webSocketService,
  }) : apiClient = apiClient ?? ApiClientService(),
       storage = storage ?? LocalStorageService(),
       discoveryClient = discoveryClient ?? ServerDiscoveryClient(),
       webSocketService = webSocketService ?? CustomerWebSocketService() {
    menuRepository = MenuRepository(this.apiClient);
    orderRepository = OrderRepository(this.apiClient);
  }

  final ApiClientService apiClient;
  final LocalStorageService storage;
  final ServerDiscoveryClient discoveryClient;
  final CustomerWebSocketService webSocketService;
  late final MenuRepository menuRepository;
  late final OrderRepository orderRepository;

  final List<StreamSubscription<Object?>> _subscriptions = [];
  Future<void>? _initializationFuture;

  bool initialized = false;
  bool menuLoading = false;
  bool connectionTesting = false;
  bool placingOrder = false;
  bool webSocketConnected = false;
  String? errorMessage;
  String? connectionMessage;
  ServerConfig? serverConfig;
  List<MenuItem> menuItems = const [];
  final Map<String, CartItem> _cart = {};
  OrderModel? currentOrder;

  List<CartItem> get cartItems => _cart.values.toList(growable: false);
  int get cartCount => _cart.values.fold(0, (sum, item) => sum + item.qty);
  double get cartTotal =>
      _cart.values.fold(0, (sum, item) => sum + item.lineTotal);
  bool get hasServer => serverConfig?.isValid == true;

  Future<void> initialize() {
    _initializationFuture ??= _initialize();
    return _initializationFuture!;
  }

  Future<void> _initialize() async {
    _subscriptions.add(webSocketService.events.listen(_handleWebSocketEvent));
    _subscriptions.add(
      webSocketService.connectionChanges.listen((connected) {
        webSocketConnected = connected;
        notifyListeners();
      }),
    );

    serverConfig = await storage.loadServerConfig();
    currentOrder = await storage.loadCurrentOrder();
    initialized = true;
    if (serverConfig != null && currentOrder != null) {
      webSocketService.connect(serverConfig!);
    }
    notifyListeners();
  }

  Future<bool> autoConnect() async {
    await initialize();
    if (connectionTesting) return false;

    connectionTesting = true;
    connectionMessage = 'Finding restaurant server...';
    errorMessage = null;
    notifyListeners();

    try {
      final launchConfig = _serverConfigFromLaunchUri();
      if (launchConfig != null) {
        connectionMessage = 'Checking launch server ${launchConfig.baseUrl}...';
        notifyListeners();
        if (await _activateServer(launchConfig)) return true;
      }

      final savedConfig = serverConfig;
      if (savedConfig?.isValid == true) {
        connectionMessage = 'Checking saved server ${savedConfig!.baseUrl}...';
        notifyListeners();
        if (await _activateServer(savedConfig, save: false)) return true;
      }

      final discoveredConfig = await discoveryClient.findServer();
      if (discoveredConfig != null) {
        connectionMessage =
            'Restaurant server found at ${discoveredConfig.baseUrl}...';
        notifyListeners();
        if (await _activateServer(discoveredConfig)) return true;
      }

      connectionMessage = kIsWeb
          ? 'No saved server found. Use the Admin local QR or enter the host.'
          : 'No restaurant server found. Make sure Admin server is running on the same WiFi.';
      return false;
    } finally {
      connectionTesting = false;
      notifyListeners();
    }
  }

  Future<bool> testConnection(ServerConfig config) async {
    connectionTesting = true;
    connectionMessage = null;
    errorMessage = null;
    notifyListeners();
    try {
      await apiClient.getHealth(config);
      serverConfig = config;
      await storage.saveServerConfig(config);
      connectionMessage = 'Connected to Admin server at ${config.baseUrl}';
      return true;
    } on ApiException catch (error) {
      connectionMessage = error.message;
      return false;
    } finally {
      connectionTesting = false;
      notifyListeners();
    }
  }

  Future<void> loadMenu() async {
    final config = serverConfig;
    if (config == null) {
      errorMessage = 'Connect to the restaurant server first.';
      notifyListeners();
      return;
    }
    menuLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      menuItems = await menuRepository.fetchMenu(config);
    } on ApiException catch (error) {
      errorMessage = error.message;
    } finally {
      menuLoading = false;
      notifyListeners();
    }
  }

  void addToCart(MenuItem item) {
    if (!item.isAvailable) return;
    final existing = _cart[item.id];
    _cart[item.id] = existing == null
        ? CartItem(menuItem: item, qty: 1)
        : existing.copyWith(qty: existing.qty + 1);
    notifyListeners();
  }

  void increaseCartItem(String menuItemId) {
    final item = _cart[menuItemId];
    if (item == null) return;
    _cart[menuItemId] = item.copyWith(qty: item.qty + 1);
    notifyListeners();
  }

  void decreaseCartItem(String menuItemId) {
    final item = _cart[menuItemId];
    if (item == null) return;
    if (item.qty <= 1) {
      _cart.remove(menuItemId);
    } else {
      _cart[menuItemId] = item.copyWith(qty: item.qty - 1);
    }
    notifyListeners();
  }

  void removeCartItem(String menuItemId) {
    _cart.remove(menuItemId);
    notifyListeners();
  }

  Future<OrderModel?> placeOrder({
    String? customerName,
    required String tableNo,
    String? note,
  }) async {
    final config = serverConfig;
    if (config == null) {
      errorMessage = 'Connect to the restaurant server first.';
      notifyListeners();
      return null;
    }
    if (_cart.isEmpty) {
      errorMessage = 'Add at least one item before placing an order.';
      notifyListeners();
      return null;
    }
    if (tableNo.trim().isEmpty) {
      errorMessage = 'Table number is required.';
      notifyListeners();
      return null;
    }
    if (placingOrder) return null;

    placingOrder = true;
    errorMessage = null;
    notifyListeners();
    try {
      final order = await orderRepository.createOrder(
        config: config,
        items: cartItems,
        customerName: customerName,
        tableNo: tableNo,
        note: note,
      );
      currentOrder = order;
      _cart.clear();
      await storage.saveCurrentOrder(order);
      webSocketService.connect(config);
      return order;
    } on ApiException catch (error) {
      errorMessage = error.message;
      return null;
    } finally {
      placingOrder = false;
      notifyListeners();
    }
  }

  Future<void> refreshCurrentOrder() async {
    final config = serverConfig;
    final order = currentOrder;
    if (config == null || order == null) return;
    try {
      final refreshed = await orderRepository.fetchOrderById(config, order.id);
      if (refreshed != null) {
        currentOrder = refreshed;
        await storage.saveCurrentOrder(refreshed);
        notifyListeners();
      }
    } on ApiException catch (error) {
      errorMessage = error.message;
      notifyListeners();
    }
  }

  Future<void> clearOrder() async {
    currentOrder = null;
    await storage.clearCurrentOrder();
    webSocketService.disconnect();
    notifyListeners();
  }

  void reconnectWebSocket() {
    final config = serverConfig;
    if (config != null && currentOrder != null) {
      webSocketService.connect(config);
    }
  }

  void clearError() {
    errorMessage = null;
    notifyListeners();
  }

  Future<bool> _activateServer(ServerConfig config, {bool save = true}) async {
    try {
      await apiClient.getHealth(config);
      serverConfig = config;
      if (save) await storage.saveServerConfig(config);
      connectionMessage = 'Connected to Admin server at ${config.baseUrl}';
      await loadMenu();
      return true;
    } on ApiException catch (error) {
      connectionMessage = error.message;
      return false;
    }
  }

  ServerConfig? _serverConfigFromLaunchUri() {
    final uri = Uri.base;
    final explicitAddress =
        uri.queryParameters['server'] ??
        uri.queryParameters['localBaseUrl'] ??
        uri.queryParameters['baseUrl'];
    if (explicitAddress != null && explicitAddress.trim().isNotEmpty) {
      return ServerConfig.fromInput(
        address: explicitAddress,
        port: uri.hasPort ? uri.port.toString() : _defaultPort(uri.scheme),
        secure: _isSecureScheme(uri.scheme),
      );
    }

    if (!kIsWeb || !_isPrivateOrLocalHost(uri.host)) return null;
    return ServerConfig.fromInput(
      address: uri.origin,
      port: uri.hasPort ? uri.port.toString() : _defaultPort(uri.scheme),
      secure: _isSecureScheme(uri.scheme),
    );
  }

  bool _isPrivateOrLocalHost(String host) {
    if (host == 'localhost' || host == '127.0.0.1' || host == '::1') {
      return true;
    }
    final parts = host.split('.').map(int.tryParse).toList(growable: false);
    if (parts.length != 4 || parts.any((part) => part == null)) return false;
    final first = parts[0]!;
    final second = parts[1]!;
    return first == 10 ||
        (first == 172 && second >= 16 && second <= 31) ||
        (first == 192 && second == 168);
  }

  bool _isSecureScheme(String scheme) {
    return scheme == 'https' || scheme == 'wss';
  }

  String _defaultPort(String scheme) =>
      _isSecureScheme(scheme) ? '443' : '8080';

  void _handleWebSocketEvent(WebSocketEvent event) async {
    if (event.type != 'order_status_updated' && event.type != 'order_created') {
      return;
    }
    final order = OrderModel.fromJson(event.data);
    if (order.id != currentOrder?.id) return;
    currentOrder = order;
    await storage.saveCurrentOrder(order);
    notifyListeners();
  }

  @override
  void dispose() {
    for (final subscription in _subscriptions) {
      unawaited(subscription.cancel());
    }
    unawaited(webSocketService.dispose());
    discoveryClient.dispose();
    apiClient.close();
    super.dispose();
  }
}
