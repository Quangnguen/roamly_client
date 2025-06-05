import { Notification } from "@/src/types/notificationInterface";

export interface NotificationRepository {
    getNotifications(): Promise<Notification[]>;
}