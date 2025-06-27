import 'reflect-metadata'

import { Provider, useSelector } from 'react-redux'
import { store } from '../src/presentation/redux/store'
import type { RootState } from '../src/presentation/redux/store'
import AppNavigator from '@/src/presentation/navigation/AppNavigator'
import Toast from 'react-native-toast-message'
import toastConfig from '../src/config/toast.config';
import React, { useEffect, useRef } from 'react';
import { useSocketWithRetry } from '@/src/hook/useSocketWithRetry';
import { socketService } from '@/src/services/socketService';

function AppContent() {
  const { connectionState, isConnected } = useSocketWithRetry(); // ✅ Bỏ connect từ đây
  const user = useSelector((state: RootState) => state.auth);
  
  // ✅ Ref để track listeners đã setup chưa
  const listenersSetupRef = useRef(false);
  const testSentRef = useRef(false);


  // ✅ Chỉ setup listeners 1 lần khi connected
  useEffect(() => {
    console.log('🔍 Socket connection state:', connectionState);
    console.log('🔍 Is connected:', isConnected);
    
    if (isConnected && user.profile?.id && !listenersSetupRef.current) {
      console.log('✅ Setting up socket listeners for user:', user.profile.id);
      
      interface NotificationData {
        message?: string;
        [key: string]: any;
      }

      // ✅ Clean up existing listeners trước
      socketService.off('new_notification');
      socketService.off('post_liked');
      socketService.off('connection_success');
      socketService.off('test_response');

      // ✅ Setup listeners mới
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

      // socketService.on('connection_success', (data: unknown) => {
      //   console.log('🎉 Connection success from _layout:', data);
      // });

      // socketService.on('test_response', (data: unknown) => {
      //   console.log('🧪 Test response received:', data);
      // });

      // ✅ Mark listeners as setup
      listenersSetupRef.current = true;

      // ✅ Test connection chỉ 1 lần
      if (!testSentRef.current) {
        setTimeout(() => {
          console.log('🧪 Testing socket connection...');
          socketService.emit('test_connection', { 
            userId: user.profile?.id,
            message: 'Hello from client',
            timestamp: new Date().toISOString()
          });
          testSentRef.current = true;
        }, 2000);
      }

    } else if (!isConnected || !user.profile?.id) {
      listenersSetupRef.current = false;
      testSentRef.current = false;
    }

    // ✅ Cleanup khi component unmount hoặc user logout
    return () => {
      if (!isConnected || !user.profile?.id) {
        console.log('🧹 Cleaning up socket listeners');
        socketService.off('new_notification');
        socketService.off('post_liked');
        socketService.off('connection_success');
        socketService.off('test_response');
        listenersSetupRef.current = false;
        testSentRef.current = false;
      }
    };
  }, [isConnected, user.profile?.id, user.isAuthenticated]); // ✅ Depend vào isConnected và user.profile.id

  // ✅ Debug connection state changes
  useEffect(() => {
    console.log('🔄 Socket connection state changed:', connectionState);
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