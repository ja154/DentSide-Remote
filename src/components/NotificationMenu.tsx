import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError, apiRequest, type NotificationFeed, type NotificationItem } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function NotificationMenu() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<NotificationFeed>({ notifications: [], unreadCount: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState('');
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiRequest<NotificationFeed>('/api/notifications');
      setFeed(data);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 404) {
        setFeed({ notifications: [], unreadCount: 0 });
        return;
      }

      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load notifications right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${user.uid}`,
        },
        () => {
          void loadNotifications();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const updateNotification = async (notification: NotificationItem, read: boolean) => {
    setActiveNotificationId(notification.id);
    setError('');

    try {
      const updated = await apiRequest<NotificationItem>(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read }),
      });

      setFeed((current) => {
        const notifications = current.notifications.map((item) =>
          item.id === notification.id ? updated : item,
        );

        return {
          notifications,
          unreadCount: notifications.filter((item) => !item.read).length,
        };
      });
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update that notification right now.';
      setError(message);
    } finally {
      setActiveNotificationId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    setError('');

    try {
      await apiRequest<{ markedRead: number }>('/api/notifications/read-all', {
        method: 'POST',
      });

      setFeed((current) => ({
        notifications: current.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      }));
    } catch (markAllError) {
      const message =
        markAllError instanceof Error
          ? markAllError.message
          : 'Unable to mark all notifications as read right now.';
      setError(message);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all active:scale-90 relative"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);

          if (nextOpen) {
            loadNotifications();
          }
        }}
        aria-label="Open notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {feed.unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center px-1">
            {feed.unreadCount > 9 ? '9+' : feed.unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-surface-container-lowest editorial-shadow rounded-2xl overflow-hidden z-[100] border border-surface-variant/20">
          <div className="p-4 flex items-center justify-between border-b border-surface-variant/10">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Notifications</h3>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {feed.unreadCount > 0
                  ? `${feed.unreadCount} unread update${feed.unreadCount === 1 ? '' : 's'}`
                  : 'All caught up'}
              </p>
            </div>

            <button
              type="button"
              className="text-[11px] font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || feed.unreadCount === 0}
            >
              {isMarkingAll ? <Loader2 size={12} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">done_all</span>}
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-10 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-primary" />
                <p className="text-xs text-on-surface-variant font-medium">Syncing feed...</p>
              </div>
            ) : feed.notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-outline-variant">mail_lock</span>
                <p className="text-sm text-on-surface-variant font-medium">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-variant/10">
                {feed.notifications.map((notification) => {
                  const isBusy = activeNotificationId === notification.id;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors ${notification.read ? 'bg-transparent' : 'bg-primary-container/5'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-[13px] font-bold text-on-surface leading-snug">
                          {notification.title}
                        </p>
                        <button
                          type="button"
                          className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline flex-shrink-0"
                          onClick={() => updateNotification(notification, !notification.read)}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : notification.read ? (
                            'Unread'
                          ) : (
                            'Read'
                          )}
                        </button>
                      </div>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed mb-2">
                        {notification.body}
                      </p>
                      <p className="text-[10px] text-outline font-medium">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-error-container/20 text-error text-[11px] font-bold border-t border-error/10">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
