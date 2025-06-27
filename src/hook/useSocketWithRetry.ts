import { useState, useRef, useEffect } from 'react';
import { socketService } from '@/src/services/socketService';

export const useSocketWithRetry = () => {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const retryCount = useRef(0);
  const maxRetries = 3;

  const connect = async () => {
    setConnectionState('connecting');
    
    try {
      await socketService.connect();
      setConnectionState('connected');
      retryCount.current = 0;
    } catch (error) {
      setConnectionState('error');
      
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        setTimeout(() => {
          connect();
        }, 2000 * retryCount.current); // Exponential backoff
      }
    }
  };

  useEffect(() => {
    connect();

    return () => {
      socketService.disconnect();
      setConnectionState('disconnected');
    };
  }, []);

  return {
    connectionState,
    retry: connect,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    hasError: connectionState === 'error',
  };
};