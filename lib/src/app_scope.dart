import 'package:flutter/widgets.dart';

import 'app_controller.dart';

class AppScope extends InheritedNotifier<CustomerAppController> {
  const AppScope({
    required CustomerAppController controller,
    required super.child,
    super.key,
  }) : super(notifier: controller);

  static CustomerAppController of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope not found.');
    return scope!.notifier!;
  }
}
