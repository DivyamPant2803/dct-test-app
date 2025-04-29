import React from 'react';
import styled from 'styled-components';

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

// Sample notifications for demo/testing
const sampleNotifications: Notification[] = [
  {
    id: '1',
    sender: '43843804',
    message: 'A Business Logic Flow mapping has been published for 1213 and AG Stamford Branch',
    timeAgo: '2m ago',
    read: false,
    category: 'business',
  },
  {
    id: '2',
    sender: '43843241',
    message: 'A Legal Logic Flow mapping has been published for 1312 and Asset Management (Americas) LLC',
    timeAgo: '10m ago',
    read: false,
    category: 'legal',
  },
  {
    id: '3',
    sender: '43843451',
    message: 'E-Discovery: A Legal Logic Flow mapping has been published for Taiwan',
    timeAgo: '30m ago',
    read: true,
    category: 'ediscovery',
  },
  {
    id: '4',
    sender: 'System',
    message: 'Static content "Important Announcement" updated.',
    timeAgo: '1h ago',
    read: false,
    category: 'other',
  },
  {
    id: '5',
    sender: '4382123',
    message: 'A Business Logic Flow mapping is sent for Version in QA for entity Europe SE, and is up for review',
    timeAgo: '2h ago',
    read: true,
    category: 'business',
  },
  {
    id: '6',
    sender: '43843123',
    message: 'Legal Input Jurisdiction Logic Flow - Re-Affirmation due for Switzerland jurisdiction / entitiy has turned to Red Zone',
    timeAgo: '3h ago',
    read: false,
    category: 'legal',
  },
  {
    id: '7',
    sender: '43843126',
    message: 'E-Discovery: Input flow for Germany jurisdiction has changed',
    timeAgo: '4h ago',
    read: true,
    category: 'ediscovery',
  },
  {
    id: '8',
    sender: 'System',
    message: '11221 has been added as a controller',
    timeAgo: '5h ago',
    read: true,
    category: 'other',
  },
];

const NotificationModal: React.FC<NotificationModalProps> = ({ open, onClose, onNotificationClick }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<'all' | NotificationCategory>('all');
  const [notifications, setNotifications] = React.useState<Notification[]>(sampleNotifications);
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal
        expanded={expanded}
        onClick={e => e.stopPropagation()}
      >
        <Header>
          <Title>Notifications</Title>
          <MarkAll onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Mark all as read</MarkAll>
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
          {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
            const cat = catKey as NotificationCategory;
            const catNotifs = notifications.filter(n => n.category === cat && (activeCategory === 'all' || activeCategory === cat));
            if (!catNotifs.length) return null;
            return (
              <div key={cat}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {catNotifs.map(n => (
                    <li
                      key={n.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        background: n.read ? '#fafafa' : meta.color + '11',
                        fontWeight: n.read ? 400 : 600, cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                        borderLeft: n.read ? '4px solid transparent' : `4px solid ${meta.color}`,
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        onNotificationClick(n.id);
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 400 }}>{n.message}</div>
                        <div style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>{n.timeAgo}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <li style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No notifications</li>
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