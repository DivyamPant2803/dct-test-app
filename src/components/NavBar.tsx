import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const NavBarContainer = styled.nav`
  width: 100%;
  background: #fff;
  border-bottom: 2px solid #ff0000;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  z-index: 100;
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

const NavBar = () => (
  <NavBarContainer>
    <NavList>
      <li>
        <StyledNavLink to="/" end>Home</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/guidance">Guidance</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/admin">Administration</StyledNavLink>
      </li>
    </NavList>
  </NavBarContainer>
);

export default NavBar; 