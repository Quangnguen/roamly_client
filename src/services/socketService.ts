import * as Notifications from 'expo-notifications';
import { io, Socket } from 'socket.io-client';
import { AppState, Platform } from 'react-native';
import { getAccessToken, getTokens } from '../utils/tokenStorage';
import { API_BASE_URL } from '../const/api';

// Define NotificationConfig interface
interface NotificationConfig {
  id: string;
  type: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  body: string;
  data: any;
  timestamp: number;
  postId?: string;
  userId?: string;
}

class SocialNetworkNotificationService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isSettingUpListeners = false;
  
  // ✅ Smart batching properties
  private notificationBatches: Map<string, NotificationConfig[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastNotificationTimes: Map<string, number> = new Map();
  
  // ✅ User preferences
  private userPreferences = {
    maxNotificationsPerMinute: 5,
    groupSimilarNotifications: true,
    quietHours: { start: 22, end: 7 },
    enabledTypes: ['comment', 'mention', 'message', 'follow', 'like', 'notification']
  };

  // ✅ Priority configuration
  private readonly PRIORITY_CONFIG = {
    urgent: { showImmediate: true, throttle: 0 },      // Messages, mentions
    high: { showImmediate: true, throttle: 1000 },     // Comments 
    medium: { showImmediate: false, throttle: 5000 },  // Follows
    low: { showImmediate: false, throttle: 10000 }     // Likes
  };

  // ✅ MISSING: Basic socket methods
  async connect(providedToken?: string) {
    try {
      if (this.socket && this.socket.connected) {
        console.log('🚫 Socket already connected, skipping...');
        return this.socket;
      }

      if (this.socket) {
        console.log('🔌 Disconnecting existing socket...');
        this.socket.disconnect();
        this.socket = null;
      }

      let accessToken = providedToken;
      
      if (!accessToken) {
        console.log('🔍 No token provided, getting from storage...');
        const tokenFromStorage = await getAccessToken();
        accessToken = tokenFromStorage === null ? undefined : tokenFromStorage;
        
        if (!accessToken) {
          const { accessToken: token } = await getTokens();
          accessToken = token === null ? undefined : token;
        }
      } else {
        console.log('✅ Using provided token');
      }

      if (!accessToken) {
        throw new Error('No access token found');
      }

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
      console.error('❌ Socket connection failed:', error);
      throw error;
    }
  }

  // ✅ MISSING: off method
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

  // ✅ MISSING: on method
  on(event: string, listener: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, listener);
      console.log(`🔊 Added listener for event: ${event}`);
    }
  }

  // ✅ MISSING: emit method
  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
      console.log(`📤 Emitted event: ${event}`, data);
    } else {
      console.log(`❌ Cannot emit ${event} - socket not connected`);
    }
  }

  // ✅ MISSING: isConnected method
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  // ✅ MISSING: getSocketId method
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // ✅ MISSING: disconnect method
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      
      // ✅ Clear notification queues
      this.notificationBatches.clear();
      this.batchTimers.forEach(timer => clearTimeout(timer));
      this.batchTimers.clear();
      this.lastNotificationTimes.clear();
      
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isSettingUpListeners = false;
    }
  }

  // ✅ MISSING: requestNotificationPermissions method
  async requestNotificationPermissions() {
    try {
      console.log('🔔 Requesting LOCAL notification permissions...');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Roamly Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Local notification permission denied');
        return false;
      }

      console.log('✅ Local notification permission granted');
      return true;
    } catch (error) {
      console.error('❌ Failed to request notification permissions:', error);
      return false;
    }
  }

  // ✅ MISSING: clearAllNotifications method
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      if (Platform.OS === 'ios') {
        await Notifications.setBadgeCountAsync(0);
      }
      console.log('🧹 All notifications cleared');
    } catch (error) {
      console.error('❌ Failed to clear notifications:', error);
    }
  }

  private readonly NOTIFICATION_TEMPLATES = {
    // 💌 Messages - Urgent priority
    'message': {
      priority: 'urgent' as const,
      title: '💌 Tin nhắn mới',
      bodyTemplate: (data: any) => {
        const senderName = data.senderName || data.sender?.name || data.user?.name || 'Ai đó';
        const messageText = data.message || data.content || '';
        
        if (messageText.length > 50) {
          return `${senderName}: ${messageText.substring(0, 50)}...`;
        }
        return `${senderName}: ${messageText}`;
      }
    },
    
    // 📞 Mentions - Urgent priority  
    'mention': {
      priority: 'urgent' as const,
      title: '📞 Bạn được nhắc đến',
      bodyTemplate: (data: any) => {
        const mentionerName = data.mentionerName || data.user?.name || 'Ai đó';
        const postTitle = data.postTitle || data.post?.title || 'một bài viết';
        return `${mentionerName} đã nhắc đến bạn trong ${postTitle}`;
      }
    },

    // 💬 Comments - High priority
    'comment': {
      priority: 'high' as const,
      title: '💬 Bình luận mới',
      bodyTemplate: (data: any) => {
        const commenterName = data.commenterName || data.user?.name || 'Ai đó';
        const commentText = data.commentText || data.content || '';
        const postTitle = data.postTitle || data.post?.title || 'bài viết của bạn';
        
        if (commentText && commentText.length > 0) {
          if (commentText.length > 60) {
            return `${commenterName}: "${commentText.substring(0, 60)}..."`;
          }
          return `${commenterName}: "${commentText}"`;
        }
        return `${commenterName} đã bình luận ${postTitle}`;
      }
    },

    // 💬 Reply to comment - High priority
    'comment_reply': {
      priority: 'high' as const,
      title: '↩️ Phản hồi bình luận',
      bodyTemplate: (data: any) => {
        const replierName = data.replierName || data.user?.name || 'Ai đó';
        const replyText = data.replyText || data.content || '';
        
        if (replyText && replyText.length > 0) {
          if (replyText.length > 60) {
            return `${replierName} phản hồi: "${replyText.substring(0, 60)}..."`;
          }
          return `${replierName} phản hồi: "${replyText}"`;
        }
        return `${replierName} đã phản hồi bình luận của bạn`;
      }
    },

    // 👥 Follows - Medium priority
    'follow': {
      priority: 'medium' as const,
      title: '👥 Người theo dõi mới',
      bodyTemplate: (data: any) => {
        const followerName = data.followerName || data.follower?.name || data.user?.name || 'Ai đó';
        const followerUsername = data.followerUsername || data.follower?.username || '';
        
        if (followerUsername) {
          return `${followerName} (@${followerUsername}) đã bắt đầu theo dõi bạn`;
        }
        return `${followerName} đã bắt đầu theo dõi bạn`;
      }
    },

    // 🤝 Friend request - Medium priority
    'friend_request': {
      priority: 'medium' as const,
      title: '🤝 Lời mời kết bạn',
      bodyTemplate: (data: any) => {
        const requesterName = data.requesterName || data.user?.name || 'Ai đó';
        return `${requesterName} đã gửi lời mời kết bạn`;
      }
    },

    // ❤️ Likes - Low priority
    'like': {
      priority: 'low' as const,
      title: '❤️ Bài viết được thích',
      bodyTemplate: (data: any) => {
        const likerName = data.likerName || data.username || 'Ai đó';
        const postTitle = data.postTitle || data.post?.title || 'bài viết của bạn';
        const count = data.count || 1;
        
        if (count > 1) {
          if (count <= 3) {
            // Show individual names for small groups
            const names = data.likerNames || [likerName];
            if (names.length === 2) {
              return `${names[0]} và ${names[1]} đã thích ${postTitle}`;
            } else if (names.length === 3) {
              return `${names[0]}, ${names[1]} và ${names[2]} đã thích ${postTitle}`;
            }
          }
          // Show count for larger groups
          return `${count} người đã thích ${postTitle}`;
        }
        
        return `${likerName} đã thích ${postTitle}`;
      }
    },

    // 🔗 Shares - Low priority
    'share': {
      priority: 'low' as const,
      title: '🔗 Bài viết được chia sẻ',
      bodyTemplate: (data: any) => {
        const sharerName = data.sharerName || data.user?.name || 'Ai đó';
        const postTitle = data.postTitle || data.post?.title || 'bài viết của bạn';
        const count = data.count || 1;
        
        if (count > 1) {
          return `${count} người đã chia sẻ ${postTitle}`;
        }
        return `${sharerName} đã chia sẻ ${postTitle}`;
      }
    },

   

    // 🔔 System notifications - Medium priority
    'system': {
      priority: 'medium' as const,
      title: '🔔 Thông báo hệ thống',
      bodyTemplate: (data: any) => {
        return data.message || data.content || 'Bạn có thông báo từ hệ thống';
      }
    },

    // 🎂 Birthday - Medium priority
    'birthday': {
      priority: 'medium' as const,
      title: '🎂 Sinh nhật',
      bodyTemplate: (data: any) => {
        const friendName = data.friendName || data.user?.name || 'Ai đó';
        return `Hôm nay là sinh nhật của ${friendName}. Hãy gửi lời chúc!`;
      }
    },

    // 📸 Photo tag - Medium priority
    'photo_tag': {
      priority: 'medium' as const,
      title: '📸 Được gắn thẻ',
      bodyTemplate: (data: any) => {
        const taggerName = data.taggerName || data.user?.name || 'Ai đó';
        const photoCount = data.photoCount || 1;
        
        if (photoCount > 1) {
          return `${taggerName} đã gắn thẻ bạn trong ${photoCount} ảnh`;
        }
        return `${taggerName} đã gắn thẻ bạn trong một ảnh`;
      }
    },


    // 📝 Event invitation - Medium priority
    'event_invite': {
      priority: 'medium' as const,
      title: '📝 Lời mời sự kiện',
      bodyTemplate: (data: any) => {
        const eventName = data.eventName || 'một sự kiện';
        const inviterName = data.inviterName || data.user?.name || 'Ai đó';
        return `${inviterName} đã mời bạn tham gia "${eventName}"`;
      }
    },

    // 🏆 Achievement - Medium priority
    'achievement': {
      priority: 'medium' as const,
      title: '🏆 Thành tích mới',
      bodyTemplate: (data: any) => {
        const achievementName = data.achievementName || 'một thành tích mới';
        return `Chúc mừng! Bạn đã đạt được ${achievementName}`;
      }
    },

    // ⚠️ Default fallback
    'notification': {
      priority: 'medium' as const,
      title: '🔔 Thông báo mới',
      bodyTemplate: (data: any) => {
        return data.message || data.content || 'Bạn có thông báo mới';
      }
    }
  };

  // ✅ UPDATED: onNewNotification với template system
  onNewNotification(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', async (data: any) => {
        console.log('📢 NEW NOTIFICATION RECEIVED:', data);
        
        if (callback) {
          callback(data);
        }

        // ✅ STEP 1: Normalize type
        const rawType = data.type || 'notification';
        const normalizedType = this.normalizeNotificationType(rawType);
        
        // ✅ STEP 2: Get template with fallback
        const hasTemplate = normalizedType in this.NOTIFICATION_TEMPLATES;
        const template = hasTemplate 
          ? this.NOTIFICATION_TEMPLATES[normalizedType as keyof typeof this.NOTIFICATION_TEMPLATES]
          : this.NOTIFICATION_TEMPLATES['notification'];
        
        // ✅ STEP 3: Debug logging
        console.log('🔍 Type processing:', {
          raw: rawType,
          normalized: normalizedType,
          hasTemplate,
          selectedTemplate: template.title
        });
        
        // ✅ STEP 4: Generate notification
        const notification: NotificationConfig = {
          id: `notification_${Date.now()}`,
          type: normalizedType,
          priority: template.priority,
          title: data.title || template.title,
          body: data.message || data.content || template.bodyTemplate(data),
          data: data,
          timestamp: Date.now(),
          postId: data.postId,
          userId: data.userId || data.actorId
        };
        
        await this.handleNotification(notification);
      });
    }
  }

  // ✅ SIMPLIFIED: Other notification methods now use templates too
  onPostLiked(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.on('post_liked', async (data: any) => {
        console.log('❤️ POST LIKED EVENT RECEIVED:', data);
        
        if (callback) {
          callback(data);
        }
        
        // ✅ Use template for consistency
        const template = this.NOTIFICATION_TEMPLATES['like'];
        
        await this.handleNotification({
          id: `like_${data.postId}_${Date.now()}`,
          type: 'like',
          priority: template.priority,
          title: template.title,
          body: template.bodyTemplate(data),
          data: data,
          timestamp: Date.now(),
          postId: data.postId,
          userId: data.likerId || data.userId
        });
      });
    }
  }

  onNewComment(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_comment', async (data: any) => {
        console.log('💬 NEW COMMENT RECEIVED:', data);
        
        if (callback) {
          callback(data);
        }
        
        // ✅ Use template
        const template = this.NOTIFICATION_TEMPLATES['comment'];
        
        await this.handleNotification({
          id: `comment_${data.postId}_${Date.now()}`,
          type: 'comment',
          priority: template.priority,
          title: template.title,
          body: template.bodyTemplate(data),
          data: data,
          timestamp: Date.now(),
          postId: data.postId,
          userId: data.commenterId || data.userId
        });
      });
    }
  }

  onNewFollower(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_follower', async (data: any) => {
        console.log('👥 NEW FOLLOWER RECEIVED:', data);
        
        if (callback) {
          callback(data);
        }
        
        // ✅ Use template
        const template = this.NOTIFICATION_TEMPLATES['follow'];
        
        await this.handleNotification({
          id: `follow_${Date.now()}`,
          type: 'follow',
          priority: template.priority,
          title: template.title,
          body: template.bodyTemplate(data),
          data: data,
          timestamp: Date.now(),
          userId: data.followerId || data.userId
        });
      });
    }
  }

  // ✅ NEW: Helper method to get notification template
  public getNotificationTemplate(type: keyof typeof this.NOTIFICATION_TEMPLATES | string) {
    if (type in this.NOTIFICATION_TEMPLATES) {
      return this.NOTIFICATION_TEMPLATES[type as keyof typeof this.NOTIFICATION_TEMPLATES];
    }
    return this.NOTIFICATION_TEMPLATES['notification'];
  }

  // ✅ NEW: Helper method to format notification body
  public formatNotificationBody(type: string, data: any): string {
    const template = this.getNotificationTemplate(type);
    return template.bodyTemplate(data);
  }

  // ✅ CORE: Smart notification handler
  private async handleNotification(notification: NotificationConfig) {
    // Skip if app is active
    if (AppState.currentState === 'active') {
      return;
    }

    // Check user preferences
    if (!this.userPreferences.enabledTypes.includes(notification.type)) {
      console.log(`🚫 Notification type ${notification.type} disabled by user`);
      return;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      console.log('🔇 Quiet hours - suppressing notification');
      return;
    }

    const priorityConfig = this.PRIORITY_CONFIG[notification.priority];

    // Urgent/High priority: Show immediately
    if (priorityConfig.showImmediate) {
      await this.showImmediateNotification(notification);
      return;
    }

    // Medium/Low priority: Batch
    await this.batchNotification(notification);
  }

  // ✅ Show immediate notification
  private async showImmediateNotification(notification: NotificationConfig) {
    const { type, timestamp } = notification;
    const lastTime = this.getLastNotificationTime(type);
    const priorityConfig = this.PRIORITY_CONFIG[notification.priority];

    if (timestamp - lastTime < priorityConfig.throttle) {
      console.log(`⏸️ Throttling ${type} notification`);
      return;
    }

    await this.showLocalNotification(notification);
    this.setLastNotificationTime(type, timestamp);
  }

  // ✅ Show local notification
  private async showLocalNotification(notification: NotificationConfig) {
    try {
      console.log('📱 Showing notification:', notification.title);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            ...notification.data,
            type: notification.type,
            timestamp: new Date().toISOString(),
          },
          sound: true,
          categoryIdentifier: notification.type,
        },
        trigger: null,
      });

      console.log('✅ Notification sent:', notification.title);
      
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }

  // ✅ Helper methods
  private isQuietHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const { start, end } = this.userPreferences.quietHours;
    
    if (start < end) {
      return hour >= start && hour < end;
    } else {
      return hour >= start || hour < end;
    }
  }

  private getLastNotificationTime(type: string): number {
    return this.lastNotificationTimes.get(type) || 0;
  }

  private setLastNotificationTime(type: string, time: number) {
    this.lastNotificationTimes.set(type, time);
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

  // ✅ Add stub methods for batching (can implement later)
  private async batchNotification(notification: NotificationConfig) {
    // For now, just show immediately
    await this.showLocalNotification(notification);
  }

  // ✅ ADD: Helper method
  private normalizeNotificationType(type: string): string {
    const lowercase = type.toLowerCase().trim();
    
    // Map common variations
    const typeMapping: Record<string, string> = {
      'post_liked': 'like',
      'postliked': 'like',
      'new_like': 'like',
      'user_liked': 'like',
      'like_post': 'like'
    };
    
    return typeMapping[lowercase] || lowercase;
  }
}

// ✅ Add interface
interface NotificationConfig {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  body: string;
  data: any;
  timestamp: number;
  userId?: string;
  postId?: string;
}

export const socketService = new SocialNetworkNotificationService();