import { useState } from 'react'
import styled from 'styled-components'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Questionnaire from './components/Questionnaire'
import ResultsTable from './components/ResultsTable'
import './App.css'
import { createGlobalStyle } from 'styled-components'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Guidance from './pages/Guidance'
import Administration from './pages/Administration'
import { StaticContentProvider } from './contexts/StaticContentContext'

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

const Title = styled.h1`
  color: black;
  margin: 0;
  font-size: 1.5rem;
`

const Subtitle = styled.p`
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.85rem;
`

const BackButton = styled.button`
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #fff5f5;
  }
`

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GlobalStyle />
    <BrowserRouter>
      <StaticContentProvider>
        <AppContainer>
          <Header>Data Transfer Compliance Tool</Header>
          <NavBar />
          <Main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guidance" element={<Guidance />} />
              <Route path="/admin" element={<Administration />} />
            </Routes>
          </Main>
        </AppContainer>
      </StaticContentProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App
