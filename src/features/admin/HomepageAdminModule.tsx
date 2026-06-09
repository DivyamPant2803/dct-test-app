import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import DraftEditor from './DraftEditor';
import ReviewScreen from './ReviewScreen';
import RoleSettings from './RoleSettings';
import { ADMIN_HOME, adminRolesPath } from './routes';

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f8fafc;
`;

const AdminNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const AdminNavBrand = styled.span`
  font-size: 0.88rem;
  font-weight: 700;
  color: #374151;
  padding: 0.75rem 1.25rem 0.75rem 0;
  margin-right: 0.5rem;
  border-right: 1px solid #e5e7eb;
`;

const NavItem = styled(NavLink)`
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;

  &:hover { color: #111827; }

  &.active {
    color: #c5152a;
    border-bottom-color: #c5152a;
    font-weight: 700;
  }
`;

const ViewLiveLink = styled(Link)`
  margin-left: auto;
  font-size: 0.78rem;
  color: #9ca3af;
  text-decoration: none;
  padding: 4px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;

  &:hover { color: #374151; border-color: #9ca3af; }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const HomepageAdminModule: React.FC = () => {
  return (
    <Shell>
      <AdminNav aria-label="Admin navigation">
        <AdminNavBrand>Homepage Admin</AdminNavBrand>
        <NavItem to={ADMIN_HOME} end>Dashboard</NavItem>
        <NavItem to={adminRolesPath()}>Role Settings</NavItem>
        <ViewLiveLink to="/central-inventory/home">
          View Live ↗
        </ViewLiveLink>
      </AdminNav>

      <Content>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="drafts/:id" element={<DraftEditor />} />
          <Route path="drafts/:id/review" element={<ReviewScreen />} />
          <Route path="roles" element={<RoleSettings />} />
          <Route path="drafts/:id/roles" element={<Navigate to={adminRolesPath()} replace />} />
          <Route path="*" element={<Navigate to={ADMIN_HOME} replace />} />
        </Routes>
      </Content>
    </Shell>
  );
};

export default HomepageAdminModule;
