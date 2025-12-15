export type NotificationType = 'upload' | 'submit_request' | 'approve' | 'reject' | 'escalate';
export type NotificationStatus = 'unread' | 'read' | 'delivered' | 'failed';
export type NotificationRecipient = 'End User' | 'Admin' | 'Legal';

export interface NotificationData {
  id: string;
  timestamp: string; // ISO 8601
  message: string;
  sender: string;
  recipient: NotificationRecipient;
  type: NotificationType;
  request_id: string;
  status: NotificationStatus;
}

export interface NotificationError {
  error: true;
  message: string;
}

export type NotificationResponse = NotificationData | NotificationError;

const NOTIFICATION_STORAGE_KEY = 'dct_notifications';
const PERSONA_MAP: Record<string, NotificationRecipient> = {
  'user': 'End User',
  'admin': 'Admin',
  'legal': 'Legal',
};

/**
 * Get all notifications for a specific persona
 */
export const getNotifications = (persona: string): NotificationData[] => {
  try {
    const recipient = PERSONA_MAP[persona] || 'End User';
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return [];
    
    const allNotifications: NotificationData[] = JSON.parse(stored);
    const filtered = allNotifications.filter(n => n.recipient === recipient);
    
    // Sort by timestamp descending (newest first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

/**
 * Create a new notification
 */
export const createNotification = (
  message: string,
  recipient: NotificationRecipient,
  type: NotificationType,
  requestId: string,
  sender: string = 'system'
): NotificationData | NotificationError => {
  try {
    const notification: NotificationData = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message,
      sender,
      recipient,
      type,
      request_id: requestId,
      status: 'unread',
    };

    // Get existing notifications
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    const allNotifications: NotificationData[] = stored ? JSON.parse(stored) : [];
    
    // Add new notification
    allNotifications.push(notification);
    
    // Save back to localStorage
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(allNotifications));
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      error: true,
      message: `Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Create multiple notifications (for batch operations)
 */
export const createNotifications = (
  notifications: Array<{
    message: string;
    recipient: NotificationRecipient;
    type: NotificationType;
    requestId: string;
    sender?: string;
  }>
): NotificationResponse[] => {
  return notifications.map(n => 
    createNotification(n.message, n.recipient, n.type, n.requestId, n.sender)
  );
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notificationId: string): void => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return;
    
    const allNotifications: NotificationData[] = JSON.parse(stored);
    const updated = allNotifications.map(n => 
      n.id === notificationId ? { ...n, status: 'read' as NotificationStatus } : n
    );
    
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Mark all notifications as read for a persona
 */
export const markAllAsRead = (persona: string): void => {
  try {
    const recipient = PERSONA_MAP[persona] || 'End User';
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return;
    
    const allNotifications: NotificationData[] = JSON.parse(stored);
    const updated = allNotifications.map(n => 
      n.recipient === recipient && n.status === 'unread' 
        ? { ...n, status: 'read' as NotificationStatus } 
        : n
    );
    
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

/**
 * Get unread count for a persona
 */
export const getUnreadCount = (persona: string): number => {
  const notifications = getNotifications(persona);
  return notifications.filter(n => n.status === 'unread').length;
};

/**
 * Get notifications as JSON array (for API response format)
 */
export const getNotificationsAsJSON = (persona: string): NotificationData[] => {
  return getNotifications(persona);
};


