import { NotificationRepository } from '@/src/data/repositories/notificationRepository';

export class NotificationUsecase {
    constructor(private notificationRepository: NotificationRepository) { }

    async getNotifications(): Promise<any> {
        return await this.notificationRepository.getNotifications();
    }

    async markAsRead(notificationId: string): Promise<any> {
        return await this.notificationRepository.markAsRead(notificationId);
    }
}