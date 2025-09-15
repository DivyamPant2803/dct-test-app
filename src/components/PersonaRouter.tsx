import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePersona } from '../contexts/PersonaContext';
import { PERSONA_DASHBOARD_CONFIGS } from '../config/personaConfig';
import Dashboard from './Dashboard';
import EndUserDashboard from './EndUserDashboard';
import AdminDashboard from './AdminDashboard';
import LegalReview from './LegalReview';
import BusinessDashboard from './BusinessDashboard';
import DISODashboard from './DISODashboard';

interface PersonaRouterProps {
  route: string;
}

const PersonaRouter: React.FC<PersonaRouterProps> = ({ route }) => {
  const { currentPersona } = usePersona();
  console.log('PersonaRouter rendering for route:', route, 'with persona:', currentPersona);

  // Handle specific routes that should use existing components
  switch (route) {
    case '/my-transfers':
      return <EndUserDashboard />;
    case '/dct':
      if (currentPersona === 'admin') {
        return <AdminDashboard />;
      }
      // For other personas, redirect to guidance
      return <Navigate to="/guidance" replace />;
    case '/legal':
      if (currentPersona === 'legal') {
        return <LegalReview />;
      }
      // For other personas, redirect to guidance
      return <Navigate to="/guidance" replace />;
    case '/business':
      if (currentPersona === 'business') {
        return <BusinessDashboard />;
      }
      // For other personas, redirect to guidance
      return <Navigate to="/guidance" replace />;
    case '/diso':
      if (currentPersona === 'diso') {
        return <DISODashboard />;
      }
      // For other personas, redirect to guidance
      return <Navigate to="/guidance" replace />;
  }

  // For persona-specific routes, use the Dashboard component
  const personaRoutes: Record<string, string> = {
    '/finance': 'finance',
    '/privacy': 'privacy'
  };

  const personaForRoute = personaRoutes[route];
  if (personaForRoute) {
    if (currentPersona === personaForRoute) {
      const config = PERSONA_DASHBOARD_CONFIGS[personaForRoute];
      return <Dashboard config={config} />;
    } else {
      // For other personas, redirect to guidance
      return <Navigate to="/guidance" replace />;
    }
  }

  // Default fallback - redirect to guidance
  return <Navigate to="/guidance" replace />;
};

export default PersonaRouter;
