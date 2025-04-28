import React from 'react';
import styled from 'styled-components';

interface NotificationIconProps {
  unreadCount: number;
  onClick: () => void;
}

const IconButton = styled.button`
  background: none;
  border: none;
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BellIcon = styled.span`
  font-size: 1.7rem;
  color: #000;
  display: flex;
  align-items: center;
`;

const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ff0000;
  color: #fff;
  border-radius: 50%;
  padding: 0.15em 0.5em;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
`;

const NotificationIcon: React.FC<NotificationIconProps> = ({ unreadCount, onClick }) => (
  <IconButton onClick={onClick} aria-label="Show notifications">
    <BellIcon role="img" aria-label="Notifications">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z" fill="#000"/>
      </svg>
    </BellIcon>
    {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
  </IconButton>
);

export default NotificationIcon; 