import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { colors, borderRadius, spacing } from '../../styles/designTokens';
import { fetchApplicationData, ApplicationData } from '../../services/applicationDataService';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  line-height: 1.6;
  margin: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.lg};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${spacing.md};
  padding-right: 2.5rem;
  border: 1.5px solid ${props => props.$hasError ? colors.semantic.error : colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
  color: ${colors.text.primary};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &::placeholder {
    color: ${colors.text.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? colors.semantic.error : colors.status.underReview};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? `${colors.semantic.error}15` : `${colors.status.underReview}15`};
  }

  &:disabled {
    background: ${colors.neutral.gray50};
    cursor: not-allowed;
  }
`;

const InputSuffix = styled.div`
  position: absolute;
  right: ${spacing.md};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: ${colors.text.tertiary};
`;

const SpinnerIcon = styled.div`
  animation: ${spin} 0.8s linear infinite;
  display: flex;
  align-items: center;
  color: ${colors.status.underReview};
`;

const FieldError = styled.div`
  font-size: 0.78rem;
  color: ${colors.semantic.error};
  margin-top: 2px;
`;

const HelpText = styled.div`
  font-size: 0.78rem;
  color: ${colors.text.tertiary};
`;

const StatusCard = styled.div<{ $type: 'loading' | 'success' | 'error' }>`
  padding: ${spacing.lg};
  border-radius: ${borderRadius.base};
  border: 1px solid;
  display: flex;
  align-items: flex-start;
  gap: ${spacing.md};

  ${props => {
    switch (props.$type) {
      case 'loading':
        return `
          background: ${colors.status.underReview}08;
          border-color: ${colors.status.underReview}30;
          color: ${colors.status.underReview};
        `;
      case 'success':
        return `
          background: ${colors.semantic.success}08;
          border-color: ${colors.semantic.success}30;
          color: ${colors.semantic.success};
        `;
      case 'error':
        return `
          background: ${colors.semantic.error}08;
          border-color: ${colors.semantic.error}30;
          color: ${colors.semantic.error};
        `;
    }
  }}
`;

const StatusIconWrapper = styled.div`
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
`;

const StatusContent = styled.div`
  flex: 1;
`;

const StatusTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
`;

const StatusMessage = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const DataSummary = styled.div`
  background: ${colors.neutral.gray50};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
`;

const DataSummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
`;

const DataSummaryTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const ResearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  background: white;
  color: ${colors.text.secondary};
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.neutral.gray400};
    color: ${colors.text.primary};
    background: ${colors.background.hover};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${spacing.md};
`;

const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const DataLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DataValue = styled.span`
  font-size: 0.875rem;
  color: ${colors.text.primary};
  font-weight: 500;
`;

interface ApplicationIdentificationStepProps {
  onDataFetched: (appData: ApplicationData) => void;
  currentData?: ApplicationData | null;
}

const ApplicationIdentificationStep: React.FC<ApplicationIdentificationStepProps> = ({
  onDataFetched,
  currentData,
}) => {
  const [appName, setAppName] = useState('');
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<ApplicationData | null>(currentData || null);
  const [error, setError] = useState<string | null>(null);
  const [appNameError, setAppNameError] = useState('');
  const [appIdError, setAppIdError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchedRef = useRef(false);

  const validateAppName = (val: string) => {
    if (!val.trim()) return 'Application name is required';
    if (val.trim().length < 2) return 'Must be at least 2 characters';
    return '';
  };

  const validateAppId = (val: string) => {
    if (!val.trim()) return 'Application ID is required';
    if (val.trim().length < 3) return 'Must be at least 3 characters';
    return '';
  };

  const doFetch = useCallback(async (name: string, id: string) => {
    if (!name.trim() || !id.trim()) return;

    setLoading(true);
    setError(null);
    fetchedRef.current = false;

    try {
      const data = await fetchApplicationData(name.trim(), id.trim());
      setAppData(data);
      fetchedRef.current = true;
      onDataFetched(data);
    } catch {
      setError('No application found for the provided name and ID. Please check your inputs.');
      setAppData(null);
    } finally {
      setLoading(false);
    }
  }, [onDataFetched]);

  useEffect(() => {
    const nameValid = appName.trim().length >= 2;
    const idValid = appId.trim().length >= 3;

    if (!nameValid || !idValid) {
      setAppData(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(appName, appId);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [appName, appId, doFetch]);

  const handleReSearch = () => {
    setAppData(null);
    setError(null);
    if (appName.trim() && appId.trim()) {
      doFetch(appName, appId);
    }
  };

  const showStatus = loading || error || appData;

  return (
    <Container>
      <Description>
        Enter your application details — data is automatically retrieved from CMDB, IAM, Data Catalog, and Compliance Registry once both fields are filled.
      </Description>

      <FormGrid>
        <FormGroup>
          <Label htmlFor="appName">Application Name *</Label>
          <InputWrapper>
            <Input
              id="appName"
              type="text"
              placeholder="e.g., Customer Data Platform"
              value={appName}
              $hasError={!!appNameError}
              onChange={e => {
                setAppName(e.target.value);
                setAppNameError('');
              }}
              onBlur={e => setAppNameError(validateAppName(e.target.value))}
              disabled={loading}
              aria-describedby={appNameError ? 'appName-error' : 'appName-help'}
            />
            {loading && (
              <InputSuffix>
                <SpinnerIcon>
                  <FiRefreshCw size={14} />
                </SpinnerIcon>
              </InputSuffix>
            )}
          </InputWrapper>
          {appNameError
            ? <FieldError id="appName-error" role="alert">{appNameError}</FieldError>
            : <HelpText id="appName-help">Official name of the application</HelpText>
          }
        </FormGroup>

        <FormGroup>
          <Label htmlFor="appId">Application ID *</Label>
          <InputWrapper>
            <Input
              id="appId"
              type="text"
              placeholder="e.g., APP-CDP-2024"
              value={appId}
              $hasError={!!appIdError}
              onChange={e => {
                setAppId(e.target.value);
                setAppIdError('');
              }}
              onBlur={e => setAppIdError(validateAppId(e.target.value))}
              disabled={loading}
              aria-describedby={appIdError ? 'appId-error' : 'appId-help'}
            />
            {loading && (
              <InputSuffix>
                <SpinnerIcon>
                  <FiRefreshCw size={14} />
                </SpinnerIcon>
              </InputSuffix>
            )}
          </InputWrapper>
          {appIdError
            ? <FieldError id="appId-error" role="alert">{appIdError}</FieldError>
            : <HelpText id="appId-help">Unique application identifier (e.g. APP-CDP-2024)</HelpText>
          }
        </FormGroup>
      </FormGrid>

      {showStatus && (
        <>
          {loading && (
            <StatusCard $type="loading">
              <StatusIconWrapper>
                <SpinnerIcon style={{ fontSize: '1.2rem' }}>
                  <FiRefreshCw />
                </SpinnerIcon>
              </StatusIconWrapper>
              <StatusContent>
                <StatusTitle>Fetching application data...</StatusTitle>
                <StatusMessage>Querying CMDB, IAM, Data Catalog, and Compliance Registry</StatusMessage>
              </StatusContent>
            </StatusCard>
          )}

          {error && !loading && (
            <StatusCard $type="error">
              <StatusIconWrapper>
                <FiAlertCircle />
              </StatusIconWrapper>
              <StatusContent>
                <StatusTitle>Application not found</StatusTitle>
                <StatusMessage>{error}</StatusMessage>
              </StatusContent>
            </StatusCard>
          )}

          {appData && !loading && (
            <>
              <StatusCard $type="success">
                <StatusIconWrapper>
                  <FiCheckCircle />
                </StatusIconWrapper>
                <StatusContent>
                  <StatusTitle>Data retrieved successfully</StatusTitle>
                  <StatusMessage>Application data will be used to pre-fill your MER template.</StatusMessage>
                </StatusContent>
              </StatusCard>

              <DataSummary>
                <DataSummaryHeader>
                  <DataSummaryTitle>Retrieved Data</DataSummaryTitle>
                  <ResearchButton onClick={handleReSearch} aria-label="Re-fetch application data">
                    <FiRefreshCw size={12} />
                    Re-search
                  </ResearchButton>
                </DataSummaryHeader>
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
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default ApplicationIdentificationStep;
