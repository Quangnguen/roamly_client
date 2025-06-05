import { ResponseInterface } from '@/src/types/ResponseInterface';
import { Notification } from '@/src/presentation/redux/slices/notificationSlice';

export interface NotificationRepository {
    getNotifications(): Promise<ResponseInterface<Notification[]>>;
} 