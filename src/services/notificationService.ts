// Workdone Notification Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute } from '../db/database.ts';
import type { Notification } from '../types/index.ts';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'ESTIMATE' | 'REVIEW' | 'VERIFICATION' | 'COMPLAINT' | 'SYSTEM';
  linkUrl?: string;
}

export function createNotification(input: CreateNotificationInput): Notification {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  execute(
    `INSERT INTO notifications (id, user_id, title, message, type, link_url, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, input.userId, input.title.trim(), input.message.trim(), input.type, input.linkUrl || null, now]
  );

  return {
    id,
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    linkUrl: input.linkUrl || null,
    isRead: false,
    createdAt: now
  };
}

export function getUserNotifications(userId: string, limit: number = 20): { notifications: Notification[]; unreadCount: number } {
  const rows = queryAll<any>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );

  const unreadCountRow = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );

  const notifications: Notification[] = rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    message: r.message,
    type: r.type,
    linkUrl: r.link_url,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at
  }));

  return {
    notifications,
    unreadCount: unreadCountRow ? unreadCountRow.count : 0
  };
}

export function markNotificationAsRead(notificationId: string, userId: string): boolean {
  const result = execute(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
  return result.changes > 0;
}

export function markAllNotificationsAsRead(userId: string): boolean {
  const result = execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
  return result.changes > 0;
}
