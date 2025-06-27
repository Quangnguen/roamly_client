import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { socketService } from '@/src/services/socketService';
import { getAccessToken, getTokens } from '@/src/utils/tokenStorage';
import { RootState } from '@/src/presentation/redux/store';

export const useSocketWithRetry = () => {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const { profile, isAuthenticated, access_token } = useSelector((state: RootState) => state.auth); // ✅ Thêm isAuthenticated
  
  // ✅ Track connection state với ref
  const hasConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  // ✅ useEffect riêng để connect khi có profile và isAuthenticated
  useEffect(() => {
    const attemptConnection = async () => {
      // ✅ Đợi một chút để token được save
      setTimeout(async () => {
        try {
          const currentUserId = profile?.id;
          
          console.log('🔍 Attempting connection for user:', currentUserId);
          console.log('🔐 Is authenticated:', isAuthenticated);
          
          if (!currentUserId || !isAuthenticated) {
            console.log('❌ No user or not authenticated');
            return;
          }

          if (hasConnectedRef.current && currentUserIdRef.current === currentUserId) {
            console.log('🚫 Already connected for this user');
            return;
          }

          if (isConnectingRef.current) {
            console.log('🚫 Connection in progress');
            return;
          }

          // ✅ Thử lấy token từ 2 nguồn
          let token = await getAccessToken();
          console.log('🔑 getAccessToken():', token ? 'Found' : 'Not found');

          if (!token) {
            console.log('🔄 Trying alternative method...');
            const { accessToken } = await getTokens();
            token = accessToken;
            console.log('🔑 getTokens():', token ? 'Found' : 'Not found');
          }

          if (!token) {
            token = access_token; // ✅ Thêm fallback từ Redux state
            console.log('🔑 access_token from Redux:', token ? 'Found' : 'Not found');
          }

          if (!token) {
            console.log('❌ No token available from any method');
            isConnectingRef.current = false;
            return;
          }

          console.log('✅ All conditions met, connecting...');
          console.log('🔑 Using token:', token.substring(0, 20) + '...');
          
          isConnectingRef.current = true;
          currentUserIdRef.current = currentUserId;
          
          setConnectionState('connecting');
          await socketService.connect(token);
          setConnectionState('connected');
          setIsConnected(true);
          
          hasConnectedRef.current = true;
          isConnectingRef.current = false;
          
          console.log('🎉 Socket connected successfully');
          
        } catch (error) {
          console.error('❌ Connection attempt failed:', error);
          setConnectionState('disconnected');
          setIsConnected(false);
          hasConnectedRef.current = false;
          isConnectingRef.current = false;
        }
      }, 1000); // ✅ Đợi 1 giây sau khi profile/auth state thay đổi
    };

    if (profile?.id && isAuthenticated) {
      attemptConnection();
    } else {
      // Reset khi logout
      setConnectionState('disconnected');
      setIsConnected(false);
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
      currentUserIdRef.current = null;
      
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
    }

  }, [profile?.id, isAuthenticated]); // ✅ Depend vào cả profile và isAuthenticated

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up socket...');
      socketService.disconnect();
      setConnectionState('disconnected');
      setIsConnected(false);
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
      currentUserIdRef.current = null;
    };
  }, []); // Empty dependency - chỉ chạy khi unmount

  const connect = async () => {
    try {
      console.log('🔄 Manual connect triggered...');
      
      if (hasConnectedRef.current && isConnected) {
        console.log('🚫 Already connected, skipping manual connect');
        return;
      }
      
      isConnectingRef.current = true;
      
      setConnectionState('connecting');
      await socketService.connect();
      setConnectionState('connected');
      setIsConnected(true);
      
      hasConnectedRef.current = true;
      isConnectingRef.current = false;
      
    } catch (error) {
      console.error('❌ Manual connect failed:', error);
      setConnectionState('disconnected');
      setIsConnected(false);
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
    }
  };

  const disconnect = () => {
    console.log('🔌 Manual disconnect triggered...');
    socketService.disconnect();
    setConnectionState('disconnected');
    setIsConnected(false);
    hasConnectedRef.current = false;
    isConnectingRef.current = false;
    currentUserIdRef.current = null;
  };

  const retry = () => {
    console.log('🔄 Retrying socket connection...');
    hasConnectedRef.current = false;
    isConnectingRef.current = false;
    connect();
  };

  return {
    connectionState,
    isConnected,
    connect,
    disconnect,
    retry,
  };
};