import { NotificationRepository } from '@/src/data/repositories/notificationRepository';
import * as notificationApi from '@/src/data/api/notificationApi';
import { ResponseInterface } from '@/src/types/ResponseInterface';
import { Notification } from '@/src/presentation/redux/slices/notificationSlice';

export class NotificationRepositoryImpl implements NotificationRepository {
    async getNotifications(): Promise<ResponseInterface<Notification[]>> {
        try {
            const response = await notificationApi.getNotificationsApi();
            return response;
        } catch (error: any) {
            throw error;
        }
    }

    async markAsRead(notificationId: string): Promise<ResponseInterface<void>> {
        try {
            const response = await notificationApi.markAsReadApi(notificationId);
            return response;
        } catch (error: any) {
            throw error;
        }
    }
}