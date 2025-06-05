import { NotificationRepository } from '../repositories/notificationRepository';

export class NotificationUsecase {
    constructor(private notificationRepository: NotificationRepository) { }

    async getNotifications(): Promise<any> {
        return await this.notificationRepository.getNotifications();
    }
}