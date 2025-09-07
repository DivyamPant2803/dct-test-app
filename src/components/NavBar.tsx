import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FiMessageCircle } from 'react-icons/fi';
import NotificationIcon from './NotificationIcon';

const NavBarContainer = styled.nav`
  width: 100%;
  background: #fff;
  border-bottom: 2px solid #ff0000;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  z-index: 100;
  position: relative;
`;

const RightSection = styled.div`
  position: absolute;
  right: 2rem;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChatbotButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const NavList = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: #222;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 4px 4px 0 0;
  transition: background 0.2s, color 0.2s;
  &.active {
    background:rgb(0, 0, 0);
    color: #fff;
  }
  &:hover {
    background: #fff5f5;
    color:rgb(0, 0, 0);
  }
`;

interface NavBarProps {
  unreadCount: number;
  onNotificationClick: () => void;
  onChatbotClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ unreadCount, onNotificationClick, onChatbotClick }) => (
  <NavBarContainer>
    <NavList>
      <li>
        <StyledNavLink to="/" end>Home</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/guidance">Guidance</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/my-transfers">My Transfers</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/dct">Administration</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/legal">Legal</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/legal-content">Legal Content</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/admin-cr">Admin CR</StyledNavLink>
      </li>
    </NavList>
    <RightSection>
      <ChatbotButton onClick={onChatbotClick}>
        <FiMessageCircle size={16} />
        Support
      </ChatbotButton>
      <NotificationIcon unreadCount={unreadCount} onClick={onNotificationClick} />
    </RightSection>
  </NavBarContainer>
);

export default NavBar; 