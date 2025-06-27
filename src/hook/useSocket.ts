import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { socketService } from '@/src/services/socketService';
import { RootState } from '@/src/presentation/redux/store';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { profile } = useSelector((state: RootState) => state.auth);
  const socketRef = useRef(socketService);

  useEffect(() => {
    if (profile) {
      // Kết nối socket khi user đã đăng nhập
      const connectSocket = async () => {
        try {
          await socketRef.current.connect();
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to connect socket:', error);
          setIsConnected(false);
        }
      };

      connectSocket();

      // Cleanup khi component unmount hoặc user logout
      return () => {
        socketRef.current.disconnect();
        setIsConnected(false);
      };
    }
  }, [profile]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};