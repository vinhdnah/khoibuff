import { create } from 'zustand';
import { NotificationItem } from '../types';
import { LocalStore } from '../lib/localStore';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: (userId: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'created_at'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: (userId: string) => {
    const list = LocalStore.getNotifications(userId);
    const unread = list.filter((n) => !n.is_read).length;
    set({ notifications: list, unreadCount: unread });
  },

  markAsRead: (id: string) => {
    const list = get().notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    const all = LocalStore.getNotifications().map((n) => (n.id === id ? { ...n, is_read: true } : n));
    LocalStore.saveNotifications(all);
    const unread = list.filter((n) => !n.is_read).length;
    set({ notifications: list, unreadCount: unread });
  },

  markAllAsRead: (userId: string) => {
    const all = LocalStore.getNotifications().map((n) => (n.user_id === userId ? { ...n, is_read: true } : n));
    LocalStore.saveNotifications(all);
    const userList = all.filter((n) => n.user_id === userId);
    set({ notifications: userList, unreadCount: 0 });
  },

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = LocalStore.getNotifications();
    all.unshift(newItem);
    LocalStore.saveNotifications(all);
    get().fetchNotifications(item.user_id);
  },
}));
