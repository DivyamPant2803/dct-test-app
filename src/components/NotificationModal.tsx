import React from 'react';
import styled from 'styled-components';

export interface Notification {
  id: string;
  sender: string;
  message: string;
  timeAgo: string;
  read: boolean;
  avatarUrl?: string;
  senderInitials?: string;
}

interface NotificationModalProps {
  open: boolean;
  notifications: Notification[];
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

const NotificationItem = styled.li<{ unread: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  background: ${({ unread }) => (unread ? 'rgba(255,0,0,0.07)' : 'transparent')};
  font-weight: ${({ unread }) => (unread ? 600 : 400)};
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  &:hover {
    background: #fff5f5;
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #222;
  font-size: 1.1rem;
  overflow: hidden;
`;

const Message = styled.div`
  flex: 1;
  font-size: 0.98rem;
`;

const TimeAgo = styled.div`
  color: #888;
  font-size: 0.85rem;
  margin-top: 2px;
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
  color: #1976d2;
  font-size: 0.97rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

// Simple user SVG icon
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="#bbb" />
    <rect x="4" y="16" width="16" height="5" rx="2.5" fill="#bbb" />
  </svg>
);

const NotificationModal: React.FC<NotificationModalProps> = ({ open, notifications, onClose, onMarkAllRead, onNotificationClick }) => {
  const [expanded, setExpanded] = React.useState(false);
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal
        expanded={expanded}
        onClick={e => e.stopPropagation()}
      >
        <Header>
          <Title>Notifications</Title>
          <MarkAll onClick={onMarkAllRead}>Mark all as read</MarkAll>
        </Header>
        <NotificationList style={expanded ? { maxHeight: 'calc(100vh - 130px)' } : {}}>
          {notifications.length === 0 && (
            <li style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No notifications</li>
          )}
          {notifications.map(n => (
            <NotificationItem key={n.id} unread={!n.read} onClick={() => onNotificationClick(n.id)}>
              <Avatar>
                {n.avatarUrl
                  ? <img src={n.avatarUrl} alt={n.sender} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  : <UserIcon />
                }
              </Avatar>
              <div>
                <Message>{n.sender} <span style={{ fontWeight: 400 }}>{n.message}</span></Message>
                <TimeAgo>{n.timeAgo}</TimeAgo>
              </div>
            </NotificationItem>
          ))}
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