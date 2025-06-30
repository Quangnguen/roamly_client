import 'reflect-metadata'

import { Provider, useSelector, useDispatch } from 'react-redux'
import { store } from '../src/presentation/redux/store'
import type { RootState, AppDispatch } from '../src/presentation/redux/store'
import AppNavigator from '@/src/presentation/navigation/AppNavigator'
import Toast from 'react-native-toast-message'
import toastConfig from '../src/config/toast.config';
import React, { useEffect, useRef } from 'react';
import { useSocketWithRetry } from '@/src/hook/useSocketWithRetry';
import { socketService } from '@/src/services/socketService'; // ✅ Named import
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { incrementLikeFromSocket, decrementLikeFromSocket } from '../src/presentation/redux/slices/postSlice';
import { incrementUnreadNotifications } from '../src/presentation/redux/slices/authSlice';
import { handleSocketNewMessage } from '../src/presentation/redux/slices/chatSlice';

function AppContent() {
  const { connectionState, isConnected } = useSocketWithRetry();
  const user = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const listenersSetupRef = useRef(false);
  const testSentRef = useRef(false);

  // ✅ Request notification permissions on app start
  useEffect(() => {
    const initNotifications = async () => {
      try {
        if (socketService && typeof socketService.requestNotificationPermissions === 'function') {
          await socketService.requestNotificationPermissions();
        }
      } catch (error) {
        console.error('❌ Failed to init notifications:', error);
      }
    };

    initNotifications();
  }, []);

  // ✅ Setup socket listeners with enhanced notifications
  useEffect(() => {
    if (isConnected && user.profile?.id && !listenersSetupRef.current) {
      // ✅ Clean up existing listeners
      if (socketService && typeof socketService.off === 'function') {
        socketService.off('new_notification');
        socketService.off('post_liked');
        socketService.off('post_unliked');
        socketService.off('new_comment');
        socketService.off('new_follower');
        // Chat listeners cleanup
        socketService.off('newMessage');
        socketService.off('messageReceived');
        socketService.off('new_message');
      }

      // ✅ UNIFIED: Single handler cho tất cả notifications
      const showNotificationToast = (data: any, type: string) => {
        // ✅ Get formatted content từ socketService
        const template = socketService.getNotificationTemplate(type);
        const formattedTitle = data.title || template.title;
        const formattedBody = data.message || data.content || template.bodyTemplate(data);

        // ✅ Determine toast type based on notification priority
        let toastType = 'info';
        switch (template.priority) {
          case 'urgent': toastType = 'error'; break;
          case 'high': toastType = 'success'; break;
          case 'medium': toastType = 'info'; break;
          case 'low': toastType = 'info'; break;
        }

        Toast.show({
          type: toastType,
          text1: formattedTitle,
          text2: formattedBody,
          visibilityTime: 4000,
        });
      };

      // ✅ Setup listeners với unified handler
      if (socketService && typeof socketService.onNewNotification === 'function') {
        socketService.onNewNotification((data: any) => {
          const notificationType = (data.type || 'notification').toLowerCase();
          showNotificationToast(data, notificationType);
        });
      }

      if (socketService && typeof socketService.onPostLiked === 'function') {
        socketService.onPostLiked((data: any) => {
          // ✅ FILTER: Bỏ qua nếu chính mình like (tránh double counting)
          const likerId = data.userId || data.likerId;
          if (likerId && likerId === user.profile?.id) {
            return;
          }

          showNotificationToast(data, 'like');

          // ✅ Tăng unread notification count
          dispatch(incrementUnreadNotifications());

          if (data.postId) {
            dispatch(incrementLikeFromSocket({ postId: data.postId, userId: likerId }));
          }
        });
      }

      if (socketService && typeof socketService.onPostUnliked === 'function') {
        socketService.onPostUnliked((data: any) => {
          // ✅ FILTER: Bỏ qua nếu chính mình unlike (tránh double counting)
          const unlikerId = data.userId || data.likerId;
          if (unlikerId && unlikerId === user.profile?.id) {
            return;
          }

          if (data.postId) {
            dispatch(decrementLikeFromSocket({ postId: data.postId, userId: unlikerId }));
          }
        });
      }

      if (socketService && typeof socketService.onNewComment === 'function') {
        socketService.onNewComment((data: any) => {
          showNotificationToast(data, 'comment');
        });
      }

      if (socketService && typeof socketService.onNewFollower === 'function') {
        socketService.onNewFollower((data: any) => {
          showNotificationToast(data, 'follow');
        });
      }

      // ✅ Chat event listeners
      if (socketService && typeof socketService.on === 'function') {
        console.log('🔌 _layout: Setting up chat event listeners');

        // Generic listener để catch tất cả events (for debugging)
        console.log('🔍 _layout: Socket service available, listening for all events...');

        // Listener cho tin nhắn mới
        socketService.on('newMessage', (data: any) => {
          console.log('📨 _layout: Received newMessage:', data);

          dispatch(handleSocketNewMessage({
            conversationId: data.conversationId,
            message: data.message || data
          }));

          // Show toast notification cho tin nhắn mới
          showNotificationToast({
            title: data.senderName || 'Tin nhắn mới',
            message: data.message?.content || data.content || 'Bạn có tin nhắn mới'
          }, 'message');
        });

        // Backup event names
        socketService.on('messageReceived', (data: any) => {
          console.log('📨 _layout: Received messageReceived:', data);

          dispatch(handleSocketNewMessage({
            conversationId: data.conversationId,
            message: data.message || data
          }));
        });

        socketService.on('new_message', (data: any) => {
          console.log('📨 _layout: Received new_message:', data);

          dispatch(handleSocketNewMessage({
            conversationId: data.conversationId,
            message: data.message || data
          }));

          showNotificationToast({
            title: data.senderName || 'Tin nhắn mới',
            message: data.message?.content || data.content || 'Bạn có tin nhắn mới'
          }, 'message');
        });

        // Thêm các event names khác có thể từ server
        ['message', 'chat_message', 'receive_message', 'message_sent'].forEach(eventName => {
          socketService.on(eventName, (data: any) => {
            console.log(`📨 _layout: Received ${eventName}:`, data);

            dispatch(handleSocketNewMessage({
              conversationId: data.conversationId,
              message: data.message || data
            }));
          });
        });
      }

      listenersSetupRef.current = true;
    }
  }, [isConnected, user.profile?.id, dispatch]);

  // ✅ Handle notification when app is opened from notification
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { categoryIdentifier, data } = response.notification.request.content;

      // ✅ Navigate based on notification type
      switch (categoryIdentifier) {
        case 'post_liked':
          // Navigate to post detail
          // navigation.navigate('PostDetail', { postId: data.postId });
          break;
        case 'new_comment':
          // Navigate to post with comments
          // navigation.navigate('PostDetail', { postId: data.postId, focusComments: true });
          break;
        case 'new_follower':
          // Navigate to profile
          // navigation.navigate('Profile', { userId: data.followerId });
          break;
        default:
          // Navigate to notifications screen
          // navigation.navigate('Notifications');
          break;
      }
    });

    return () => subscription.remove();
  }, []);

  // ✅ Thêm AppState listener
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Clear notifications when app becomes active
        if (socketService && typeof socketService.clearAllNotifications === 'function') {
          socketService.clearAllNotifications();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppNavigator />
      <Toast config={toastConfig} position="top" />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}