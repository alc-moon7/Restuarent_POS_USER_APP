import 'dart:async';

import 'package:flutter/material.dart';

import 'app_controller.dart';
import 'app_scope.dart';
import 'screens/cart_screen.dart';
import 'screens/connect_server_screen.dart';
import 'screens/menu_screen.dart';
import 'screens/order_tracking_screen.dart';
import 'screens/splash_screen.dart';
import 'theme/app_theme.dart';

class LocalPosMenuApp extends StatefulWidget {
  const LocalPosMenuApp({super.key});

  @override
  State<LocalPosMenuApp> createState() => _LocalPosMenuAppState();
}

class _LocalPosMenuAppState extends State<LocalPosMenuApp> {
  late final CustomerAppController _controller;

  @override
  void initState() {
    super.initState();
    _controller = CustomerAppController();
    unawaited(_controller.initialize());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      controller: _controller,
      child: MaterialApp(
        title: 'Restaurant POS Ordering',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        builder: (context, child) {
          final media = MediaQuery.of(context);
          return MediaQuery(
            data: media.copyWith(
              textScaler: media.textScaler.clamp(maxScaleFactor: 1.15),
            ),
            child: child ?? const SizedBox.shrink(),
          );
        },
        initialRoute: '/splash',
        routes: {
          '/splash': (_) => const SplashScreen(),
          '/connect': (_) => const ConnectServerScreen(),
          '/menu': (_) => const MenuScreen(),
          '/cart': (_) => const CartScreen(),
          '/tracking': (_) => const OrderTrackingScreen(),
        },
      ),
    );
  }
}
