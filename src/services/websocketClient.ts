type WebSocketEventHandler = (event: Record<string, unknown>) => void;

type RealtimeClientOptions = {
  url: string;
  onEvent: WebSocketEventHandler;
  onStateChange?: (state: 'connecting' | 'connected' | 'reconnecting' | 'closed') => void;
};

export class RealtimeClient {
  private socket?: WebSocket;
  private reconnectTimer?: number;
  private attempt = 0;
  private closed = false;

  constructor(private readonly options: RealtimeClientOptions) {}

  connect() {
    this.closed = false;
    this.open();
  }

  close() {
    this.closed = true;
    window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.options.onStateChange?.('closed');
  }

  private open() {
    if (!this.options.url) return;
    this.options.onStateChange?.(this.attempt === 0 ? 'connecting' : 'reconnecting');
    try {
      this.socket = new WebSocket(this.options.url);
      this.socket.onopen = () => {
        this.attempt = 0;
        this.options.onStateChange?.('connected');
      };
      this.socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as Record<string, unknown>;
          this.options.onEvent(event);
        } catch {
          // Ignore malformed realtime messages and keep polling fallback alive.
        }
      };
      this.socket.onclose = () => this.scheduleReconnect();
      this.socket.onerror = () => this.scheduleReconnect();
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.closed) return;
    window.clearTimeout(this.reconnectTimer);
    this.options.onStateChange?.('reconnecting');
    this.attempt += 1;
    const delay = Math.min(20000, 1000 * 2 ** Math.min(this.attempt, 5));
    this.reconnectTimer = window.setTimeout(() => this.open(), delay);
  }
}
