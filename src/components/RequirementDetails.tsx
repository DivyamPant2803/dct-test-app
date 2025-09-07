import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Requirement, RequirementVersion } from '../types/index';
import { useRequirementsApi } from '../hooks/useRequirementsApi';
import DiffViewer from './DiffViewer';
import { FiClock, FiUser, FiCalendar, FiRotateCcw } from 'react-icons/fi';

interface RequirementDetailsProps {
  requirementId: string;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const MetaLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const MetaValue = styled.span`
  color: #222;
`;

const VersionBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e0f2fe;
  color: #0277bd;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f8f8f8'};
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const RequirementText = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
`;

const VersionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VersionItem = styled.div<{ $isCurrent?: boolean }>`
  padding: 1rem;
  border: 1px solid ${props => props.$isCurrent ? '#222' : '#e9ecef'};
  border-radius: 8px;
  background: ${props => props.$isCurrent ? '#f8f9fa' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #222;
    background: #f8f9fa;
  }
`;

const VersionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const VersionTitle = styled.div`
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VersionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

const VersionText = styled.div`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DiffSection = styled.div`
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'primary' ? `
    background: #222;
    color: white;
    
    &:hover {
      background: #444;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #222;
    border: 1px solid #ccc;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

type TabType = 'current' | 'history';

const RequirementDetails: React.FC<RequirementDetailsProps> = ({ requirementId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [versions, setVersions] = useState<RequirementVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<RequirementVersion | null>(null);

  const { getRequirementById, getRequirementVersions } = useRequirementsApi();

  // Load requirement and versions
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqData, versionsData] = await Promise.all([
        getRequirementById(requirementId),
        getRequirementVersions(requirementId)
      ]);
      
      setRequirement(reqData);
      setVersions(versionsData);
      
      // Set current version as selected by default
      if (versionsData.length > 0) {
        setSelectedVersion(versionsData[0]); // First item is the latest version
      }
    } catch (error) {
      console.error('Error loading requirement details:', error);
    } finally {
      setLoading(false);
    }
  }, [requirementId, getRequirementById, getRequirementVersions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVersionSelect = (version: RequirementVersion) => {
    setSelectedVersion(version);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionDisplayText = (text: string) => {
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading requirement details...</LoadingMessage>
      </Container>
    );
  }

  if (!requirement) {
    return (
      <Container>
        <NoDataMessage>Requirement not found</NoDataMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{requirement.title}</Title>
        <MetaInfo>
          <MetaItem>
            <FiUser />
            <MetaLabel>Jurisdiction:</MetaLabel>
            <MetaValue>{requirement.jurisdiction}</MetaValue>
          </MetaItem>
          <MetaItem>
            <FiUser />
            <MetaLabel>Entity:</MetaLabel>
            <MetaValue>{requirement.entity}</MetaValue>
          </MetaItem>
          <MetaItem>
            <FiUser />
            <MetaLabel>Subject Type:</MetaLabel>
            <MetaValue>{requirement.subjectType}</MetaValue>
          </MetaItem>
          <MetaItem>
            <FiCalendar />
            <MetaLabel>Version:</MetaLabel>
            <VersionBadge>v{requirement.version}</VersionBadge>
          </MetaItem>
          <MetaItem>
            <FiCalendar />
            <MetaLabel>Last Updated:</MetaLabel>
            <MetaValue>{formatDate(requirement.updatedAt)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <FiUser />
            <MetaLabel>Last Modified By:</MetaLabel>
            <MetaValue>{requirement.lastModifiedBy}</MetaValue>
          </MetaItem>
        </MetaInfo>
      </Header>

      <Tabs>
        <Tab 
          $active={activeTab === 'current'} 
          onClick={() => setActiveTab('current')}
        >
          Current Version
        </Tab>
        <Tab 
          $active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          Version History
        </Tab>
      </Tabs>

      {activeTab === 'current' && (
        <Section>
          <SectionTitle>Current Requirement Text</SectionTitle>
          <RequirementText>{requirement.text}</RequirementText>
        </Section>
      )}

      {activeTab === 'history' && (
        <Section>
          <SectionTitle>Version History</SectionTitle>
          
          {versions.length === 0 ? (
            <NoDataMessage>No version history available</NoDataMessage>
          ) : (
            <VersionList>
              {versions.map((version, index) => (
                <VersionItem
                  key={version.id}
                  $isCurrent={index === 0}
                  onClick={() => handleVersionSelect(version)}
                >
                  <VersionHeader>
                    <VersionTitle>
                      Version {version.version}
                      {index === 0 && <VersionBadge>Current</VersionBadge>}
                    </VersionTitle>
                    <VersionMeta>
                      <MetaItem>
                        <FiUser />
                        {version.author}
                      </MetaItem>
                      <MetaItem>
                        <FiCalendar />
                        {formatDate(version.date)}
                      </MetaItem>
                      {version.changeRequestId && (
                        <MetaItem>
                          <FiClock />
                          CR: {version.changeRequestId}
                        </MetaItem>
                      )}
                    </VersionMeta>
                  </VersionHeader>
                  <VersionText>{getVersionDisplayText(version.text)}</VersionText>
                </VersionItem>
              ))}
            </VersionList>
          )}

          {selectedVersion && versions.length > 1 && (
            <DiffSection>
              <SectionTitle>
                Compare with Version {selectedVersion.version}
              </SectionTitle>
              <DiffViewer
                originalText={requirement.text}
                proposedText={selectedVersion.text}
                title={`Version ${requirement.version} vs Version ${selectedVersion.version}`}
              />
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <Button $variant="secondary" disabled>
                  <FiRotateCcw />
                  Rollback to Version {selectedVersion.version} (Disabled in MVP)
                </Button>
              </div>
            </DiffSection>
          )}
        </Section>
      )}
    </Container>
  );
};

export default RequirementDetails;
