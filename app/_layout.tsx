import 'reflect-metadata'

import { Provider, useSelector } from 'react-redux'
import { store } from '../src/presentation/redux/store'
import type { RootState } from '../src/presentation/redux/store'
import AppNavigator from '@/src/presentation/navigation/AppNavigator'
import Toast from 'react-native-toast-message'
import toastConfig from '../src/config/toast.config';
import React, { useEffect, useRef } from 'react';
import { useSocketWithRetry } from '@/src/hook/useSocketWithRetry';
import { socketService } from '@/src/services/socketService'; // ✅ Named import
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

function AppContent() {
  const { connectionState, isConnected } = useSocketWithRetry();
  const user = useSelector((state: RootState) => state.auth);
  
  const listenersSetupRef = useRef(false);
  const testSentRef = useRef(false);

  // ✅ Debug logs với safe access
  console.log('👤 User profile:', user.profile);
  console.log('🔐 Is authenticated:', user.isAuthenticated);
  console.log('🔗 Connection state:', connectionState);
  console.log('📡 Is connected:', isConnected);
  console.log('🔍 Socket service exists:', !!socketService);
  console.log('🔍 Socket isConnected method exists:', typeof socketService?.isConnected);

  // ✅ Request notification permissions on app start
  useEffect(() => {
    const initNotifications = async () => {
      try {
        if (socketService && typeof socketService.requestNotificationPermissions === 'function') {
          await socketService.requestNotificationPermissions();
        } else {
          console.log('⚠️ requestNotificationPermissions method not available');
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
      console.log('✅ Setting up enhanced socket listeners for user:', user.profile.id);
      
      // ✅ Clean up existing listeners
      if (socketService && typeof socketService.off === 'function') {
        socketService.off('new_notification');
        socketService.off('post_liked');
        socketService.off('new_comment');
        socketService.off('new_follower');
      }

      // ✅ UNIFIED: Single handler cho tất cả notifications
      const showNotificationToast = (data: any, type: string) => {
        console.log(`📢 ${type.toUpperCase()} DATA:`, data);
        
        // ✅ Get formatted content từ socketService
        const template = socketService.getNotificationTemplate(type);
        const formattedTitle = data.title || template.title;
        const formattedBody = data.message || data.content || template.bodyTemplate(data);
        
        console.log('🎯 Formatted notification:', {
          type,
          title: formattedTitle,
          body: formattedBody
        });
        
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
          showNotificationToast(data, 'like');
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

      listenersSetupRef.current = true;
    }
  }, [isConnected, user.profile?.id]);

  // ✅ Handle notification when app is opened from notification
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { categoryIdentifier, data } = response.notification.request.content;
      
      console.log('📱 Notification tapped:', categoryIdentifier, data);
      
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
      console.log('📱 App state changed to:', nextAppState);
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
    <>
      <AppNavigator />
      <Toast config={toastConfig} position="top" />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}