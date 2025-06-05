import { NotificationRepository } from '@/src/domain/repositories/notificationRepository';
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
}