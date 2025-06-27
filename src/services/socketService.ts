import io, { Socket } from 'socket.io-client';
import { getTokens, getAccessToken } from '@/src/utils/tokenStorage';
import { API_BASE_URL } from '@/src/const/api';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isSettingUpListeners = false;

  async connect(providedToken?: string) { // ✅ Cho phép pass token
    try {
      // ✅ Kiểm tra đã connected chưa
      if (this.socket && this.socket.connected) {
        return this.socket;
      }

      // ✅ Disconnect existing socket
      if (this.socket) {
        console.log('🔌 Disconnecting existing socket...');
        this.socket.disconnect();
        this.socket = null;
      }

      // ✅ Dùng token được pass vào hoặc lấy từ storage
      let accessToken = providedToken;
      
      

      if (!accessToken) {
        throw new Error('No access token found');
      }

      console.log('🌐 Connecting to:', API_BASE_URL);
      console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');
      
      this.socket = io(API_BASE_URL, {
        auth: {
          token: accessToken,
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
      });

      this.setupEventListeners();
      
      return this.socket;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Thêm method OFF
  off(event: string, listener?: (...args: any[]) => void) {
    if (this.socket) {
      if (listener) {
        this.socket.off(event, listener);
      } else {
        this.socket.removeAllListeners(event);
      }
      console.log(`🔇 Removed listener for event: ${event}`);
    }
  }

  // ✅ Thêm method ON generic
  on(event: string, listener: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, listener);
      console.log(`🔊 Added listener for event: ${event}`);
    }
  }

  // ✅ Thêm method EMIT
  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
      console.log(`📤 Emitted event: ${event}`, data);
    } else {
      console.log(`❌ Cannot emit ${event} - socket not connected`);
    }
  }

  // ✅ Existing notification methods
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

  // ✅ Check connection status
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isSettingUpListeners = false;
    }
  }

  // Force reconnect
  reconnect() {
    console.log('🔄 Reconnecting socket...');
    this.disconnect();
    this.connect();
  }

  private setupEventListeners() {
    if (!this.socket || this.isSettingUpListeners) {
      return;
    }

    console.log('📡 Setting up socket event listeners...');
    this.isSettingUpListeners = true;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.isSettingUpListeners = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isSettingUpListeners = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      this.isSettingUpListeners = false;
    });
  }
}

export const socketService = new SocketService();