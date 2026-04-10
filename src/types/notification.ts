export interface NotificationQuery {
  userId?: string;
  type?: string[];
  isRead?: boolean;
  limit?: number;
  offset?: number;
  page?: number;
}