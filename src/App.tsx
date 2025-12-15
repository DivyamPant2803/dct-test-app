import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { createGlobalStyle } from 'styled-components'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Guidance from './pages/Guidance'
import CentralInventory from './pages/CentralInventory'
import { Administration } from './pages/Administration'
import NotificationModal from './components/NotificationModal'
import homeContentHtml from './static/homeContentHtml'
import RequirementDetails from './components/RequirementDetails'
import SupportChatbotPanel from './components/SupportChatbotPanel'
import { PersonaProvider, usePersona } from './contexts/PersonaContext'
import PersonaRouter from './components/PersonaRouter'
import { getUnreadCount } from './services/notificationService'
import { ToastProvider } from './components/common'

const queryClient = new QueryClient()

// Add type definitions
type CountryEntities = {
  'United States': string[];
  'Germany': string[];
  'Singapore': string[];
  'United Kingdom': string[];
  [key: string]: string[]; // Allow additional countries
};

export type FormData = {
  informationCategory: string[];
  dataSubjectType: string[];
  countries: string[];
  entities: CountryEntities;
  recipientType: string[];
};

export const INITIAL_FORM_DATA: FormData = {
  informationCategory: ['Employee'],
  dataSubjectType: ['Current Employee'],
  countries: ['United States', 'Germany', 'Singapore', 'United Kingdom'],
  entities: {
    'United States': [
      'US Global Technology Solutions Corporation',
      'American Data Analytics & Consulting Services LLC',
      'US Enterprise Business Management Systems Inc.',
      'North American Digital Infrastructure Holdings',
      'US Financial Technology & Services Corporation',
      'American Cloud Computing & Data Centers LLC'
    ],
    'Germany': [
      'Deutsche Technologie und Datendienste GmbH',
      'Europäische Unternehmensberatung AG',
      'Deutsche Digitale Infrastruktur und Services GmbH',
      'Berliner Technologiezentrum für Innovation GmbH',
      'Deutsche Cloud- und Rechenzentren AG'
    ],
    'Singapore': [
      'Singapore Advanced Technology Solutions Pte Ltd',
      'APAC Digital Infrastructure & Services Corporation',
      'Singapore Enterprise Data Management Pte Ltd',
      'Asia Pacific Cloud Computing Holdings Pte Ltd',
      'Singapore Business Analytics & Consulting Services'
    ],
    'United Kingdom': [
      'British Technology & Innovation Services Ltd',
      'UK Enterprise Data Solutions Corporation',
      'London Digital Infrastructure Management Ltd',
      'British Business Analytics & Consulting Group',
      'UK Cloud Computing & Data Centre Operations Ltd'
    ],
    'Japan': [
      'Japan Technology Solutions Corporation 株式会社',
      'Tokyo Digital Infrastructure Services 株式会社',
      'Japanese Enterprise Systems & Consulting 株式会社',
      'Japan Cloud Computing Solutions Corporation',
      'Tokyo Business Analytics & Data Services Ltd'
    ],
    'South Korea': [
      'Korean Enterprise Technology Solutions Co., Ltd',
      'Seoul Digital Infrastructure & Services Corporation',
      'Korean Business Systems & Analytics Corporation',
      'Korea Cloud Computing & Data Center Operations',
      'Seoul Advanced Technology Consulting Services'
    ]
  },
  recipientType: ['Group Entity']
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }

  #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
`

const AppContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  color: black;
  display: flex;
  flex-direction: column;
  overflow: auto;
`

const Header = styled.header`
  width: 100%;
  height: 60px;
  font-size: 1.5rem;
  padding: 0.75rem 2rem;
  text-align: center;
  position: relative;
  flex-shrink: 0;
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Main = styled.main`
  flex: 1;
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  background: #f5f5f5;
  overflow: auto;
`

const AppContent = () => {
  const { currentPersona } = usePersona();
  const [modalOpen, setModalOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when persona changes or periodically
  useEffect(() => {
    const updateUnreadCount = () => {
      const count = getUnreadCount(currentPersona);
      setUnreadCount(count);
    };
    
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [currentPersona]);

  const handleNotificationClick = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    // Refresh unread count when modal closes
    setUnreadCount(getUnreadCount(currentPersona));
  };
  const handleMarkAllRead = () => {
    // NotificationModal handles marking as read, just refresh count
    setUnreadCount(getUnreadCount(currentPersona));
  };
  const handleNotificationItemClick = (_id: string) => {
    // NotificationModal handles marking as read, just refresh count
    setUnreadCount(getUnreadCount(currentPersona));
  };
  const handleChatbotClick = () => setChatbotOpen(true);
  const handleChatbotClose = () => setChatbotOpen(false);

  return (
    <AppContainer>
      <Header>Data Transfer Compliance Tool</Header>
      <NavBar 
        unreadCount={unreadCount} 
        onNotificationClick={handleNotificationClick}
        onChatbotClick={handleChatbotClick}
      />
      <NotificationModal
        open={modalOpen}
        onClose={handleModalClose}
        onMarkAllRead={handleMarkAllRead}
        onNotificationClick={handleNotificationItemClick}
      />
      <Main>
        <Routes>
          <Route path="/" element={<Home homeContentHtml={homeContentHtml} />} />
          <Route path="/guidance" element={<Guidance />} />
          <Route path="/central-inventory" element={<CentralInventory />} />
          <Route path="/admin" element={<Administration />} />
          <Route path="/my-transfers" element={<PersonaRouter route="/my-transfers" />} />
          <Route path="/dct" element={<PersonaRouter route="/dct" />} />
          <Route path="/legal" element={<PersonaRouter route="/legal" />} />
          <Route path="/legal-content" element={<PersonaRouter route="/legal-content" />} />
          <Route path="/business" element={<PersonaRouter route="/business" />} />
          <Route path="/diso" element={<PersonaRouter route="/diso" />} />
          <Route path="/requirement/:id" element={<RequirementDetails requirementId="req-1" />} />
        </Routes>
      </Main>
      
      <SupportChatbotPanel
        isOpen={chatbotOpen}
        onClose={handleChatbotClose}
      />
    </AppContainer>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyle />
      <BrowserRouter>
        <PersonaProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </PersonaProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App
