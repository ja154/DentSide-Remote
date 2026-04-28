import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Loader2, MailOpen } from 'lucide-react';
import { ApiError, apiRequest, type NotificationFeed, type NotificationItem } from '../lib/api';

export default function NotificationMenu() {
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
        className="ds-btn ds-btn-ghost ds-btn-sm"
        style={{ padding: '7px 10px', borderRadius: '50%', position: 'relative' }}
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);

          if (nextOpen) {
            loadNotifications();
          }
        }}
        aria-label="Open notifications"
      >
        <Bell size={15} />
        {feed.unreadCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: 'var(--color-ruby)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {feed.unreadCount > 9 ? '9+' : feed.unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="ds-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 'min(360px, calc(100vw - 32px))',
            padding: 0,
            overflow: 'hidden',
            zIndex: 120,
            boxShadow: '0 18px 40px rgba(13, 15, 14, 0.12)',
          }}
        >
          <div
            className="ds-card-header"
            style={{ padding: '16px 18px', alignItems: 'center', gap: 12 }}
          >
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                Notifications
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                {feed.unreadCount > 0
                  ? `${feed.unreadCount} unread update${feed.unreadCount === 1 ? '' : 's'}`
                  : 'You are all caught up'}
              </p>
            </div>

            <button
              type="button"
              className="ds-btn ds-btn-ghost ds-btn-sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || feed.unreadCount === 0}
              style={{ marginLeft: 'auto' }}
            >
              {isMarkingAll ? <Loader2 size={13} className="spin" /> : <CheckCheck size={13} />}
              Mark all read
            </button>
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Loader2 size={18} className="spin" color="var(--color-teal)" />
              </div>
            ) : feed.notifications.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center' }}>
                <MailOpen size={24} color="var(--color-fog-4)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                  No notifications yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {feed.notifications.map((notification) => {
                  const isBusy = activeNotificationId === notification.id;

                  return (
                    <div
                      key={notification.id}
                      style={{
                        padding: '14px 18px',
                        borderTop: '1px solid var(--color-fog-2)',
                        background: notification.read ? 'var(--color-white)' : 'var(--color-teal-light)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                          marginBottom: 6,
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
                          {notification.title}
                        </p>
                        <button
                          type="button"
                          className="ds-btn ds-btn-ghost ds-btn-sm"
                          style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}
                          onClick={() => updateNotification(notification, !notification.read)}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <Loader2 size={12} className="spin" />
                          ) : notification.read ? (
                            'Unread'
                          ) : (
                            'Read'
                          )}
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--color-ink-4)',
                          lineHeight: 1.55,
                          marginBottom: 8,
                        }}
                      >
                        {notification.body}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error ? (
            <div
              style={{
                borderTop: '1px solid var(--color-fog-2)',
                padding: '10px 18px',
                fontSize: 12,
                color: 'var(--color-ruby)',
              }}
            >
              {error}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
