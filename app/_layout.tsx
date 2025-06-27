import 'reflect-metadata'

import { Provider, useSelector } from 'react-redux'
import { store } from '../src/presentation/redux/store'
import type { RootState } from '../src/presentation/redux/store'
import AppNavigator from '@/src/presentation/navigation/AppNavigator'
import Toast from 'react-native-toast-message'
import toastConfig from '../src/config/toast.config';
import React, { useEffect } from 'react';
import { useSocketWithRetry } from '@/src/hook/useSocketWithRetry';
import { socketService } from '@/src/services/socketService';

function AppContent() {
  const { connectionState, isConnected, retry } = useSocketWithRetry();
  const user = useSelector((state: RootState) => state.auth);
  // console.log('👤 User profile:', user.profile);

  useEffect(() => {
    console.log('👤 Current user ID:', user.profile?.id);
    console.log('🔍 Socket connection state:', connectionState);
    console.log('🔍 Is connected:', isConnected);
    
    if (isConnected && user.profile?.id) {
      console.log('✅ Setting up socket listeners for user:', user.profile.id);
      
      interface NotificationData {
        message?: string;
        [key: string]: any;
      }

      // Setup listeners
      socketService.onNewNotification((data: NotificationData) => {
        console.log('📢 NEW NOTIFICATION RECEIVED:', data);
        Toast.show({
          type: 'success',
          text1: '🔔 Thông báo mới',
          text2: data.message || 'Bạn có thông báo mới',
        });
      });
      socketService.onPostLiked((data: unknown) => {
        console.log('❤️ POST LIKED EVENT RECEIVED:', data);
        Toast.show({
          type: 'info',
          text1: '❤️ Bài viết được thích',
          text2: 'Ai đó vừa thích bài viết của bạn',
        });
      });
      socketService.on('connection_success', (data: unknown) => {
        console.log('🎉 Connection success:', data);
      });
      socketService.on('test_response', (data: unknown) => {
        console.log('🧪 Test response received:', data);
      });

      // Test connection sau 2 giây
      setTimeout(() => {
        console.log('🧪 Testing socket connection...');
        socketService.emit('test_connection', { 
          userId: user.profile?.id,
          message: 'Hello from client',
          timestamp: new Date().toISOString()
        });
      }, 2000);

    } else {
      console.log('❌ Cannot setup listeners - Socket not connected or no user');
    }

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socketService.off('new_notification');
      socketService.off('post_liked');
      socketService.off('connection_success');
      socketService.off('test_response');
    };
  }, [isConnected, user.profile?.id]);

  // Optional: Show connection status
  useEffect(() => {
    console.log('Socket connection state:', connectionState);
  }, [connectionState]);

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