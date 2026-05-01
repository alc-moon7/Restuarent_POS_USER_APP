import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AppScaffold extends StatelessWidget {
  const AppScaffold({
    required this.title,
    required this.child,
    this.subtitle,
    this.actions = const [],
    this.bottomNavigationBar,
    super.key,
  });

  final String title;
  final String? subtitle;
  final Widget child;
  final List<Widget> actions;
  final Widget? bottomNavigationBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      bottomNavigationBar: bottomNavigationBar,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: EdgeInsets.fromLTRB(
                _padding(context),
                18,
                _padding(context),
                10,
              ),
              sliver: SliverToBoxAdapter(
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1180),
                    child: _Header(
                      title: title,
                      subtitle: subtitle,
                      actions: actions,
                    ),
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: EdgeInsets.fromLTRB(
                _padding(context),
                0,
                _padding(context),
                24,
              ),
              sliver: SliverToBoxAdapter(
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1180),
                    child: child,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _padding(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width >= 1100) return 32;
    if (width >= 700) return 24;
    return 16;
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.title, required this.actions, this.subtitle});

  final String title;
  final String? subtitle;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 560;
        final titleBlock = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: textTheme.headlineMedium),
            if (subtitle != null) ...[
              const SizedBox(height: 5),
              Text(subtitle!, style: textTheme.bodyMedium),
            ],
          ],
        );
        if (actions.isEmpty) return titleBlock;
        if (compact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              titleBlock,
              const SizedBox(height: 10),
              Wrap(spacing: 8, runSpacing: 8, children: actions),
            ],
          );
        }
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: titleBlock),
            const SizedBox(width: 12),
            Wrap(spacing: 8, runSpacing: 8, children: actions),
          ],
        );
      },
    );
  }
}
