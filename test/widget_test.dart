import 'package:customer_res/src/theme/app_theme.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('theme exposes customer ordering brand colors', () {
    final theme = AppTheme.light();

    expect(theme.colorScheme.primary.toARGB32(), 0xFF006C5B);
    expect(theme.colorScheme.secondary.toARGB32(), 0xFFF97316);
    expect(theme.useMaterial3, isTrue);
  });
}
