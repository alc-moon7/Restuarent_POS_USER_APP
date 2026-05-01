import 'package:flutter/material.dart';

import '../app_scope.dart';
import '../models/server_config.dart';
import '../theme/app_theme.dart';
import '../widgets/primary_button.dart';

class ConnectServerScreen extends StatefulWidget {
  const ConnectServerScreen({super.key});

  @override
  State<ConnectServerScreen> createState() => _ConnectServerScreenState();
}

class _ConnectServerScreenState extends State<ConnectServerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _ipController = TextEditingController();
  final _portController = TextEditingController(text: '8080');
  bool _hydrated = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hydrated) return;
    final config = AppScope.of(context).serverConfig;
    if (config != null) {
      _ipController.text = config.ip;
      _portController.text = config.port.toString();
    }
    _hydrated = true;
  }

  @override
  void dispose() {
    _ipController.dispose();
    _portController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = AppScope.of(context);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 620),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(18),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 58,
                          height: 58,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: const Icon(
                            Icons.wifi_tethering,
                            color: AppColors.primary,
                            size: 30,
                          ),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          'Connect to restaurant server',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Connect to the same restaurant WiFi. Internet is not required.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: _ipController,
                          keyboardType: TextInputType.url,
                          decoration: const InputDecoration(
                            labelText: 'Admin IP address',
                            hintText: '192.168.0.105',
                            prefixIcon: Icon(Icons.router_outlined),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Admin IP is required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _portController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Port',
                            prefixIcon: Icon(Icons.settings_ethernet),
                          ),
                          validator: (value) {
                            final port = int.tryParse(value ?? '');
                            if (port == null || port <= 0 || port > 65535) {
                              return 'Use a valid port';
                            }
                            return null;
                          },
                        ),
                        if (app.connectionMessage != null) ...[
                          const SizedBox(height: 14),
                          _ConnectionMessage(message: app.connectionMessage!),
                        ],
                        const SizedBox(height: 20),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            PrimaryButton(
                              label: 'Test Connection',
                              icon: Icons.network_check,
                              loading: app.connectionTesting,
                              onPressed: () => _testConnection(app),
                            ),
                            PrimaryButton(
                              label: 'Continue',
                              icon: Icons.arrow_forward,
                              secondary: true,
                              loading: app.connectionTesting,
                              onPressed: () => _continue(app),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _testConnection(dynamic app) async {
    if (!_formKey.currentState!.validate()) return;
    await app.testConnection(_configFromFields());
  }

  Future<void> _continue(dynamic app) async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await app.testConnection(_configFromFields());
    if (!mounted || ok != true) return;
    await app.loadMenu();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/menu');
  }

  ServerConfig _configFromFields() {
    return ServerConfig(
      ip: _ipController.text.trim(),
      port: int.tryParse(_portController.text.trim()) ?? 8080,
    );
  }
}

class _ConnectionMessage extends StatelessWidget {
  const _ConnectionMessage({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final success = message.toLowerCase().contains('connected');
    final color = success ? AppColors.success : AppColors.danger;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(
            success ? Icons.check_circle : Icons.error_outline,
            color: color,
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}
