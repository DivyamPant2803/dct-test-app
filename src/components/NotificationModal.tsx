import React from 'react';
import styled from 'styled-components';
import { usePersona } from '../contexts/PersonaContext';
import { getNotifications, markNotificationAsRead, markAllAsRead, NotificationData } from '../services/notificationService';

export type NotificationCategory = 'business' | 'legal' | 'ediscovery' | 'other';
export interface Notification {
  id: string;
  sender: string;
  message: string;
  timeAgo: string;
  read: boolean;
  category: NotificationCategory;
  avatarUrl?: string;
  senderInitials?: string;
}

// Helper to convert NotificationData to display format
const formatNotification = (data: NotificationData): Notification => {
  const timeAgo = getTimeAgo(data.timestamp);
  const category = getCategoryFromType(data.type);
  
  return {
    id: data.id,
    sender: data.sender,
    message: data.message,
    timeAgo,
    read: data.status === 'read',
    category,
    senderInitials: data.sender === 'system' ? 'SYS' : data.sender.substring(0, 2).toUpperCase(),
  };
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};

const getCategoryFromType = (type: string): NotificationCategory => {
  switch (type) {
    case 'submit_request':
    case 'approve':
    case 'reject':
      return 'business';
    case 'escalate':
      return 'legal';
    case 'upload':
      return 'ediscovery';
    default:
      return 'other';
  }
};

const CATEGORY_META: Record<NotificationCategory, { label: string; color: string; }> = {
  business: {
    label: 'Business Flow',
    color: '#757575',
  },
  legal: {
    label: 'Legal Flow',
    color: '#757575',
  },
  ediscovery: {
    label: 'E-Discovery',
    color: '#757575',
  },
  other: {
    label: 'Others',
    color: '#757575',
  },
};

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (id: string) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.15);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
`;

const Modal = styled.div<{ expanded?: boolean }>`
  margin-top: ${({ expanded }) => expanded ? '0' : '70px'};
  margin-right: ${({ expanded }) => expanded ? '0' : '32px'};
  width: ${({ expanded }) => expanded ? '420px' : '350px'};
  max-width: 95vw;
  height: ${({ expanded }) => expanded ? '100vh' : 'auto'};
  background: #fff;
  border-radius: ${({ expanded }) => expanded ? '0' : '10px'};
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: ${({ expanded }) => expanded ? 'fixed' : 'static'};
  top: 0;
  right: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const MarkAll = styled.button`
  background: none;
  border: none;
  color: #ff0000;
  font-size: 0.95rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 350px;
  overflow-y: auto;
`;

const ViewAll = styled.div`
  text-align: center;
  padding: 0.7rem 0;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: #ff0000;
  font-size: 0.97rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;


const NotificationModal: React.FC<NotificationModalProps> = ({ open, onClose, onMarkAllRead, onNotificationClick }) => {
  const { currentPersona } = usePersona();
  const [expanded, setExpanded] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<'all' | NotificationCategory>('all');
  
  // Load notifications from service based on current persona
  const [notificationData, setNotificationData] = React.useState(() => getNotifications(currentPersona));
  
  // Refresh notifications when modal opens or persona changes
  React.useEffect(() => {
    if (open) {
      setNotificationData(getNotifications(currentPersona));
    }
  }, [currentPersona, open]);
  
  const notifications = React.useMemo(() => {
    return notificationData.map(formatNotification);
  }, [notificationData]);
  
  const handleMarkAllRead = () => {
    markAllAsRead(currentPersona);
    setNotificationData(getNotifications(currentPersona));
    onMarkAllRead();
  };
  
  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
    setNotificationData(getNotifications(currentPersona));
    onNotificationClick(id);
  };
  
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal
        expanded={expanded}
        onClick={e => e.stopPropagation()}
      >
        <Header>
          <Title>Notifications</Title>
          <MarkAll onClick={handleMarkAllRead}>Mark all as read</MarkAll>
        </Header>
        <div style={{ display: 'flex', gap: 6, margin: '10px 0', padding: '0 1.25rem', flexWrap: 'wrap' }}>
          {(['all', ...Object.keys(CATEGORY_META)] as const).map(cat => (
            <button
              key={cat}
              style={{
                background: activeCategory === cat ? (cat === 'all' ? '#222' : CATEGORY_META[cat as NotificationCategory]?.color || '#eee') : '#fff',
                color: activeCategory === cat ? '#fff' : '#222',
                border: '1px solid #ddd',
                borderRadius: 14,
                padding: '2px 10px',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 12,
                minWidth: 0,
                whiteSpace: 'nowrap',
              }}
              onClick={() => setActiveCategory(cat as any)}
            >
              {cat === 'all' ? 'All' : CATEGORY_META[cat as NotificationCategory].label}
            </button>
          ))}
        </div>
        <NotificationList style={expanded ? { maxHeight: 'calc(100vh - 180px)' } : {}}>
          {notifications.length === 0 ? (
            <li style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No notifications</li>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {notifications
                .filter(n => activeCategory === 'all' || n.category === activeCategory)
                .map(n => {
                  const meta = CATEGORY_META[n.category];
                  return (
                    <li
                      key={n.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        background: n.read ? '#fafafa' : meta.color + '11',
                        fontWeight: n.read ? 400 : 600, cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                        borderLeft: n.read ? '4px solid transparent' : `4px solid ${meta.color}`,
                        transition: 'background 0.2s',
                      }}
                      onClick={() => handleNotificationClick(n.id)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 400 }}>{n.message}</div>
                        <div style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>{n.timeAgo}</div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </NotificationList>
        <ViewAll>
          <ViewAllLink onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Collapse' : 'View All'}
          </ViewAllLink>
        </ViewAll>
      </Modal>
    </Overlay>
  );
};

export default NotificationModal; 