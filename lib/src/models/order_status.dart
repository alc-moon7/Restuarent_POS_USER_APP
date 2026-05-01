enum OrderStatus {
  pending,
  accepted,
  preparing,
  ready,
  served,
  cancelled;

  String get value => name;

  String get label {
    switch (this) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.accepted:
        return 'Accepted';
      case OrderStatus.preparing:
        return 'Preparing';
      case OrderStatus.ready:
        return 'Ready';
      case OrderStatus.served:
        return 'Served';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  int get progressIndex {
    switch (this) {
      case OrderStatus.pending:
        return 0;
      case OrderStatus.accepted:
        return 1;
      case OrderStatus.preparing:
        return 2;
      case OrderStatus.ready:
        return 3;
      case OrderStatus.served:
        return 4;
      case OrderStatus.cancelled:
        return -1;
    }
  }

  static OrderStatus parse(String? value) {
    final normalized = value?.trim().toLowerCase();
    for (final status in OrderStatus.values) {
      if (status.value == normalized) return status;
    }
    return OrderStatus.pending;
  }
}
