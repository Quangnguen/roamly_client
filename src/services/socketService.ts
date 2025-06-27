import io, { Socket } from 'socket.io-client';
import { getTokens } from '@/src/utils/tokenStorage';
import { API_BASE_URL } from '@/src/const/api';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect() {
    try {
      const { accessToken } = await getTokens();
      
      this.socket = io(API_BASE_URL, {
        auth: {
          token: accessToken,
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: false,
        extraHeaders: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      this.setupEventListeners();
      
      return this.socket;
    } catch (error) {
      console.error('Socket connection failed:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      
    });

    // Lắng nghe connection success từ server
    this.socket.on('connection_success', (data) => {
      console.log('🎉 Connection success from server:', data);
    });

    // // Lắng nghe test response
    // this.socket.on('test_response', (data) => {
    //   console.log('🧪 Test response:', data);
    // });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('❌ Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Debug: Log tất cả events
    this.socket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event received: ${eventName}`, args);
    });
  }

  // Thêm các methods thiếu
  onNewNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  onPostLiked(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('post_liked', callback);
    }
  }

  onPostUnliked(callback: (data: { postId: string; userId: string; likeCount: number }) => void) {
    if (this.socket) {
      this.socket.on('post_unliked', callback);
    }
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Emit events
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Join room
  joinRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', roomId);
    }
  }

  // Leave room
  leaveRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket manually disconnected');
    }
  }

  // Force reconnect
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}

export const socketService = new SocketService();