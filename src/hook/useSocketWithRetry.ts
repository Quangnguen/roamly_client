import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { socketService } from '@/src/services/socketService';
import { RootState } from '@/src/presentation/redux/store';

export const useSocketWithRetry = () => {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const { profile, isAuthenticated } = useSelector((state: RootState) => state.auth); // ✅ Thêm isAuthenticated

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
          console.log('🔌 [useSocketWithRetry] Starting connection attempt for user:', currentUserId);

          if (!currentUserId || !isAuthenticated) {
            console.log('🔌 [useSocketWithRetry] Skipping - no userId or not authenticated');
            return;
          }

          if (hasConnectedRef.current && currentUserIdRef.current === currentUserId) {
            console.log('🔌 [useSocketWithRetry] Already connected for this user, skipping');
            return;
          }

          if (isConnectingRef.current) {
            console.log('🔌 [useSocketWithRetry] Connection already in progress, skipping');
            return;
          }

          console.log('🔌 [useSocketWithRetry] User authenticated, proceeding with connection...');

          console.log('🔌 [useSocketWithRetry] Starting socket connection...');
          isConnectingRef.current = true;
          currentUserIdRef.current = currentUserId;

          setConnectionState('connecting');
          await socketService.connect(currentUserId);
          console.log('🔌 [useSocketWithRetry] Socket connection successful!');
          setConnectionState('connected');
          setIsConnected(true);

          hasConnectedRef.current = true;
          isConnectingRef.current = false;

        } catch (error) {
          console.error('🔌 [useSocketWithRetry] Connection attempt failed:', error);
          setConnectionState('disconnected');
          setIsConnected(false);
          hasConnectedRef.current = false;
          isConnectingRef.current = false;
        }
      }, 1000); // ✅ Đợi 1 giây sau khi profile/auth state thay đổi
    };

    if (profile?.id && isAuthenticated) {
      console.log('🔌 [useSocketWithRetry] User authenticated, attempting connection...');
      attemptConnection();
    } else {
      console.log('🔌 [useSocketWithRetry] User not authenticated or no profile, disconnecting...');
      // Reset khi logout
      setConnectionState('disconnected');
      setIsConnected(false);
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
      currentUserIdRef.current = null;

      if (socketService.isConnected()) {
        console.log('🔌 [useSocketWithRetry] Disconnecting socket...');
        socketService.disconnect();
      }
    }

  }, [profile?.id, isAuthenticated]); // ✅ Depend vào cả profile và isAuthenticated

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    console.log('🔌 [useSocketWithRetry] Component mounted, will cleanup on unmount');
    return () => {
      console.log('🔌 [useSocketWithRetry] Component unmounting, cleaning up...');
      socketService.disconnect();
      setConnectionState('disconnected');
      setIsConnected(false);
      hasConnectedRef.current = false;
      isConnectingRef.current = false;
      currentUserIdRef.current = null;
      console.log('🔌 [useSocketWithRetry] Cleanup completed');
    };
  }, []); // Empty dependency - chỉ chạy khi unmount

  const connect = async () => {
    try {
      const userId = profile?.id;
      if (!userId) {
        console.error('❌ Manual connect failed: No userId available');
        return;
      }

      if (hasConnectedRef.current && isConnected) {
        return;
      }

      isConnectingRef.current = true;

      setConnectionState('connecting');
      await socketService.connect(userId);
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