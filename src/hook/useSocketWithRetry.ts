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
          
          
          if (!currentUserId || !isAuthenticated) {
            return;
          }

          if (hasConnectedRef.current && currentUserIdRef.current === currentUserId) {
            return;
          }

          if (isConnectingRef.current) {
            return;
          }

          // ✅ Thử lấy token từ 2 nguồn
          let token = await getAccessToken();

          if (!token) {
            const { accessToken } = await getTokens();
            token = accessToken;
          }

          if (!token) {
            token = access_token; // ✅ Thêm fallback từ Redux state
          }

          if (!token) {
            isConnectingRef.current = false;
            return;
          }

          isConnectingRef.current = true;
          currentUserIdRef.current = currentUserId;
          
          setConnectionState('connecting');
          await socketService.connect(token);
          setConnectionState('connected');
          setIsConnected(true);
          
          hasConnectedRef.current = true;
          isConnectingRef.current = false;
          
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
      
      if (hasConnectedRef.current && isConnected) {
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
    socketService.disconnect();
    setConnectionState('disconnected');
    setIsConnected(false);
    hasConnectedRef.current = false;
    isConnectingRef.current = false;
    currentUserIdRef.current = null;
  };

  const retry = () => {
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