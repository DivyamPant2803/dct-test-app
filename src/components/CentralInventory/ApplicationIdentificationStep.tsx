import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { fetchApplicationData, ApplicationData } from '../../services/applicationDataService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.base};
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.lg};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.95rem;
  color: ${colors.text.primary};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }
  
  &:disabled {
    background: ${colors.neutral.gray100};
    cursor: not-allowed;
  }
`;

const HelpText = styled.span`
  font-size: 0.8rem;
  color: ${colors.text.secondary};
`;

const FetchButton = styled.button<{ $disabled: boolean }>`
  background-color: ${props => props.$disabled ? colors.neutral.gray400 : colors.status.underReview};
  color: white;
  border: none;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.base};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  align-self: flex-start;
  box-shadow: ${shadows.sm};

  &:hover:not(:disabled) {
    background-color: ${colors.status.approved};
    transform: translateY(-2px);
    box-shadow: ${shadows.base};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const StatusCard = styled.div<{ $type: 'loading' | 'success' | 'error' }>`
  padding: ${spacing.lg};
  border-radius: ${borderRadius.base};
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
  
  ${props => {
    switch (props.$type) {
      case 'loading':
        return `
          background: ${colors.status.underReview}10;
          border-color: ${colors.status.underReview}40;
          color: ${colors.status.underReview};
        `;
      case 'success':
        return `
          background: ${colors.semantic.success}10;
          border-color: ${colors.semantic.success}40;
          color: ${colors.semantic.success};
        `;
      case 'error':
        return `
          background: ${colors.semantic.error}10;
          border-color: ${colors.semantic.error}40;
          color: ${colors.semantic.error};
        `;
    }
  }}
`;

const StatusIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  ${props => props.className?.includes('loading') && `
    animation: spin 1s linear infinite;
  `}
`;

const StatusContent = styled.div`
  flex: 1;
`;

const StatusTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatusMessage = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const DataSummary = styled.div`
  background: ${colors.neutral.gray50};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
  margin-top: ${spacing.md};
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing.md};
`;

const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DataLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.text.secondary};
  text-transform: uppercase;
`;

const DataValue = styled.span`
  font-size: 0.9rem;
  color: ${colors.text.primary};
  font-weight: 500;
`;

const ContinueButton = styled.button<{ $disabled: boolean }>`
  background-color: ${props => props.$disabled ? colors.neutral.gray400 : colors.neutral.black};
  color: white;
  border: none;
  padding: ${spacing.base} ${spacing.xl};
  border-radius: ${borderRadius.base};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  align-self: flex-start;
  box-shadow: ${shadows.sm};

  &:hover:not(:disabled) {
    background-color: ${colors.neutral.gray800};
    transform: translateY(-2px);
    box-shadow: ${shadows.base};
  }
`;

interface ApplicationIdentificationStepProps {
  onComplete: (appData: ApplicationData) => void;
}

const ApplicationIdentificationStep: React.FC<ApplicationIdentificationStepProps> = ({ onComplete }) => {
  const [appName, setAppName] = useState('');
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<ApplicationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!appName.trim() || !appId.trim()) return;

    setLoading(true);
    setError(null);
    setAppData(null);

    try {
      const data = await fetchApplicationData(appName.trim(), appId.trim());
      setAppData(data);
    } catch (err) {
      setError('Failed to fetch application data. Please check your inputs and try again.');
      console.error('Error fetching application data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (appData) {
      onComplete(appData);
    }
  };

  const canFetch = appName.trim().length > 0 && appId.trim().length > 0 && !loading;
  const canContinue = appData !== null && !loading;

  return (
    <Container>
      <div>
        <Title>Application Identification</Title>
        <Description>
          Enter your application details to automatically fetch and prefill compliance data from multiple sources (CMDB, IAM, Data Catalog, Compliance Registry).
        </Description>
      </div>

      <FormGrid>
        <FormGroup>
          <Label htmlFor="appName">Application Name *</Label>
          <Input
            id="appName"
            type="text"
            placeholder="e.g., Customer Data Platform"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            disabled={loading}
          />
          <HelpText>Official name of the application</HelpText>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="appId">Application ID *</Label>
          <Input
            id="appId"
            type="text"
            placeholder="e.g., APP-CDP-2024"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            disabled={loading}
          />
          <HelpText>Unique application identifier</HelpText>
        </FormGroup>
      </FormGrid>

      <FetchButton
        $disabled={!canFetch}
        onClick={handleFetchData}
        disabled={!canFetch}
      >
        <FiSearch />
        Fetch Application Data
      </FetchButton>

      {loading && (
        <StatusCard $type="loading">
          <StatusIcon className="loading">
            <FiLoader />
          </StatusIcon>
          <StatusContent>
            <StatusTitle>Fetching Data...</StatusTitle>
            <StatusMessage>
              Retrieving application details from CMDB, IAM, Data Catalog, and Compliance Registry
            </StatusMessage>
          </StatusContent>
        </StatusCard>
      )}

      {error && (
        <StatusCard $type="error">
          <StatusIcon>
            <FiAlertCircle />
          </StatusIcon>
          <StatusContent>
            <StatusTitle>Error</StatusTitle>
            <StatusMessage>{error}</StatusMessage>
          </StatusContent>
        </StatusCard>
      )}

      {appData && !loading && (
        <>
          <StatusCard $type="success">
            <StatusIcon>
              <FiCheckCircle />
            </StatusIcon>
            <StatusContent>
              <StatusTitle>Data Retrieved Successfully</StatusTitle>
              <StatusMessage>
                Application data has been fetched and will be used to prefill your MER template
              </StatusMessage>
            </StatusContent>
          </StatusCard>

          <DataSummary>
            <DataGrid>
              <DataItem>
                <DataLabel>Owner / Manager</DataLabel>
                <DataValue>{appData.owner}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Data Classification</DataLabel>
                <DataValue>{appData.dataClassification}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Deployment Model</DataLabel>
                <DataValue>{appData.deploymentModel}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Locations</DataLabel>
                <DataValue>{appData.locations.join(', ')}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Hosting Provider</DataLabel>
                <DataValue>{appData.hostingProvider}</DataValue>
              </DataItem>
              <DataItem>
                <DataLabel>Compliance Flags</DataLabel>
                <DataValue>{appData.complianceFlags.join(', ') || 'None'}</DataValue>
              </DataItem>
            </DataGrid>
          </DataSummary>

          <ContinueButton
            $disabled={!canContinue}
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continue to MER Template
          </ContinueButton>
        </>
      )}
    </Container>
  );
};

export default ApplicationIdentificationStep;
