import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Transfer, RequirementRow, Evidence } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import UploadEvidenceModal from './UploadEvidenceModal';
import StatusChip from './StatusChip';
import AuditTrailModal from './AuditTrailModal';
import StyledSelect from './common/StyledSelect';
import { FiEye, FiTrash2, FiDownload, FiRefreshCw } from 'react-icons/fi';

const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RefreshButton = styled.button`
  position: fixed;
  top: 100px;
  right: 2rem;
  background: #222;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    background: #444;
    transform: translateY(-2px);
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background: #f8f8f8;
  padding: 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${props => props.variant === 'primary' ? '#222' : '#ccc'};
  background: ${props => props.variant === 'primary' ? '#222' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#444' : '#f8f8f8'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
`;

const EvidenceButton = styled.button<{ variant?: 'view' | 'delete' | 'download' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'view': return '#3b82f6';
      case 'delete': return '#ef4444';
      case 'download': return '#10b981';
      default: return '#e5e5e5';
    }
  }};
  border-radius: 4px;
  background: white;
  color: ${props => {
    switch (props.variant) {
      case 'view': return '#3b82f6';
      case 'delete': return '#ef4444';
      case 'download': return '#10b981';
      default: return '#555';
    }
  }};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.25rem;

  &:hover {
    background: ${props => {
      switch (props.variant) {
        case 'view': return '#eff6ff';
        case 'delete': return '#fef2f2';
        case 'download': return '#f0fdf4';
        default: return '#f8f9fa';
      }
    }};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const FilePreview = styled.div`
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-top: 0.5rem;
  font-size: 0.8rem;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #222;
  margin-bottom: 0.25rem;
`;

const FileMeta = styled.div`
  color: #666;
  font-size: 0.75rem;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const TransferSelector = styled.div`
  margin-bottom: 1.5rem;
`;

const SelectWrapper = styled.div`
  min-width: 300px;
`;


const EndUserDashboard: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string>('');
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementRow | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<Evidence[]>([]);
  const [showEvidencePreview, setShowEvidencePreview] = useState<Evidence | null>(null);

  const { getTransfers, getTransferRequirements, getAllEvidence, deleteEvidence, previewEvidence } = useEvidenceApi();

  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    try {
      // Refresh transfers
      const transfersData = await getTransfers();
      const evidenceData = await getAllEvidence();
      
      const transfersWithEvidence = transfersData.filter(transfer => 
        evidenceData.some(evidence => 
          evidence.requirementId.includes(transfer.entity.toLowerCase().replace(/\s+/g, '-')) &&
          evidence.requirementId.includes(transfer.jurisdiction.toLowerCase().replace(/\s+/g, '-'))
        )
      );
      
      setTransfers(transfersWithEvidence);
      
      // Refresh requirements if a transfer is selected
      if (selectedTransferId) {
        const requirementsData = await getTransferRequirements(selectedTransferId);
        setRequirements(requirementsData);
      }
      
      // Refresh evidence
      setUploadedEvidence(evidenceData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [getTransfers, getAllEvidence, getTransferRequirements, selectedTransferId]);

  useEffect(() => {
    const loadTransfers = async () => {
      setLoading(true);
      try {
        // Only load transfers that have evidence uploaded from Guidance page
        const transfersData = await getTransfers();
        const evidenceData = await getAllEvidence();
        
        // Filter transfers to only show those with uploaded evidence
        const transfersWithEvidence = transfersData.filter(transfer => 
          evidenceData.some(evidence => 
            evidence.requirementId.includes(transfer.entity.toLowerCase().replace(/\s+/g, '-')) &&
            evidence.requirementId.includes(transfer.jurisdiction.toLowerCase().replace(/\s+/g, '-'))
          )
        );
        
        setTransfers(transfersWithEvidence);
        if (transfersWithEvidence.length > 0) {
          setSelectedTransferId(transfersWithEvidence[0].id);
        }
      } catch (error) {
        console.error('Failed to load transfers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, [getTransfers, getAllEvidence]);

  useEffect(() => {
    const loadRequirements = async () => {
      if (!selectedTransferId) return;
      
      setLoading(true);
      try {
        const data = await getTransferRequirements(selectedTransferId);
        setRequirements(data);
      } catch (error) {
        console.error('Failed to load requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, [selectedTransferId, getTransferRequirements]);

  useEffect(() => {
    const loadUploadedEvidence = async () => {
      try {
        // Load all evidence for the user
        const evidence = await getAllEvidence();
        setUploadedEvidence(evidence);
      } catch (error) {
        console.error('Failed to load uploaded evidence:', error);
      }
    };

    loadUploadedEvidence();
  }, [getAllEvidence]);

  // Refresh data when component mounts or when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      refreshAllData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAllData]);

  // Refresh data periodically to catch updates from admin reviews
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshAllData]);

  const handleUploadClick = (requirement: RequirementRow) => {
    setSelectedRequirement(requirement);
    setShowUploadModal(true);
  };

  const handleViewAudit = (requirement: RequirementRow) => {
    setSelectedRequirement(requirement);
    setShowAuditModal(true);
  };

  const handleUploadSuccess = () => {
    // Refresh requirements to show updated status
    const loadRequirements = async () => {
      if (!selectedTransferId) return;
      try {
        const data = await getTransferRequirements(selectedTransferId);
        setRequirements(data);
      } catch (error) {
        console.error('Failed to refresh requirements:', error);
      }
    };
    loadRequirements();

    // Refresh uploaded evidence
    const loadUploadedEvidence = async () => {
      try {
        const evidence = await getAllEvidence();
        setUploadedEvidence(evidence);
      } catch (error) {
        console.error('Failed to refresh uploaded evidence:', error);
      }
    };
    loadUploadedEvidence();
  };

  const handleViewEvidence = (evidence: Evidence) => {
    // Use the new preview function to open the actual file
    previewEvidence(evidence);
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (window.confirm('Are you sure you want to delete this evidence?')) {
      try {
        await deleteEvidence(evidenceId);
        // Refresh the evidence list
        const evidence = await getAllEvidence();
        setUploadedEvidence(evidence);
      } catch (error) {
        console.error('Failed to delete evidence:', error);
        alert('Failed to delete evidence. Please try again.');
      }
    }
  };

  const handleDownloadEvidence = (evidence: Evidence) => {
    if (evidence.base64Data) {
      // Convert base64 to blob and trigger download
      const byteCharacters = atob(evidence.base64Data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `application/${evidence.fileType.toLowerCase()}` });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = evidence.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedTransfer = transfers.find(t => t.id === selectedTransferId);

  // Filter evidence based on selected transfer
  const filteredEvidence = selectedTransferId 
    ? uploadedEvidence.filter(evidence => 
        evidence.requirementId.includes(selectedTransfer?.entity.toLowerCase().replace(/\s+/g, '-') || '') &&
        evidence.requirementId.includes(selectedTransfer?.jurisdiction.toLowerCase().replace(/\s+/g, '-') || '')
      )
    : uploadedEvidence;

  return (
    <DashboardContainer>
      <RefreshButton onClick={refreshAllData} title="Refresh Data">
        <FiRefreshCw size={20} />
      </RefreshButton>
      
      <Section>
        <SectionTitle>My Transfers</SectionTitle>
        <TransferSelector>
          <SelectWrapper>
            <StyledSelect
              value={selectedTransferId}
              onChange={setSelectedTransferId}
              options={[
                { value: '', label: 'Select a transfer...' },
                ...transfers.map(transfer => ({
                  value: transfer.id,
                  label: `${transfer.name} - ${transfer.jurisdiction}`
                }))
              ]}
              placeholder="Select a transfer..."
            />
          </SelectWrapper>
        </TransferSelector>
        
        {selectedTransfer && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#222' }}>Transfer Details</h4>
            <p style={{ margin: '0.25rem 0', color: '#666' }}>
              <strong>Entity:</strong> {selectedTransfer.entity}
            </p>
            <p style={{ margin: '0.25rem 0', color: '#666' }}>
              <strong>Subject Type:</strong> {selectedTransfer.subjectType}
            </p>
            <p style={{ margin: '0.25rem 0', color: '#666' }}>
              <strong>Status:</strong> {selectedTransfer.status}
            </p>
          </div>
        )}
      </Section>

      {transfers.length > 0 && (
        <Section>
          <SectionTitle>Requirements for Selected Transfer</SectionTitle>
          {loading ? (
            <NoDataMessage>Loading requirements...</NoDataMessage>
          ) : requirements.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <Th>Requirement</Th>
                  <Th>Jurisdiction</Th>
                  <Th>Entity</Th>
                  <Th>Subject Type</Th>
                  <Th>Status</Th>
                  <Th>Last Updated</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((requirement) => (
                  <Tr key={requirement.id}>
                    <Td>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                          {requirement.name}
                        </div>
                        {requirement.description && (
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            {requirement.description}
                          </div>
                        )}
                      </div>
                    </Td>
                    <Td>{requirement.jurisdiction}</Td>
                    <Td>{requirement.entity}</Td>
                    <Td>{requirement.subjectType}</Td>
                    <Td>
                      <StatusChip status={requirement.status} />
                    </Td>
                    <Td>{new Date(requirement.updatedAt).toLocaleDateString()}</Td>
                    <Td>
                      <ActionButton
                        variant="primary"
                        onClick={() => handleUploadClick(requirement)}
                        disabled={requirement.status === 'APPROVED'}
                      >
                        Upload
                      </ActionButton>
                      <ActionButton
                        variant="secondary"
                        onClick={() => handleViewAudit(requirement)}
                      >
                        View
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <NoDataMessage>No requirements found for the selected transfer</NoDataMessage>
          )}
        </Section>
      )}

      <Section>
        <SectionTitle>Uploaded Evidence</SectionTitle>
        {filteredEvidence.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Entity</Th>
                <Th>Country</Th>
                <Th>File Name</Th>
                <Th>File Size</Th>
                <Th>Upload Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((evidence) => {
                // Extract entity and country from requirement ID
                const parts = evidence.requirementId.split('-');
                const entity = parts[1]?.replace(/-/g, ' ') || 'Unknown Entity';
                const country = parts[2]?.replace(/-/g, ' ') || 'Unknown Country';
                
                return (
                <Tr key={evidence.id}>
                  <Td>{entity}</Td>
                  <Td>{country}</Td>
                  <Td>
                    <FileName>{evidence.filename}</FileName>
                    {evidence.description && (
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        {evidence.description}
                      </div>
                    )}
                  </Td>
                  <Td>{formatFileSize(evidence.size)}</Td>
                  <Td>{new Date(evidence.uploadedAt).toLocaleDateString()}</Td>
                  <Td>
                    <StatusChip status={evidence.status} />
                  </Td>
                  <Td>
                    <EvidenceButton variant="view" onClick={() => handleViewEvidence(evidence)}>
                      <FiEye size={12} />
                      View
                    </EvidenceButton>
                    <EvidenceButton variant="download" onClick={() => handleDownloadEvidence(evidence)}>
                      <FiDownload size={12} />
                      Download
                    </EvidenceButton>
                    <EvidenceButton variant="delete" onClick={() => handleDeleteEvidence(evidence.id)}>
                      <FiTrash2 size={12} />
                      Delete
                    </EvidenceButton>
                  </Td>
                </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <NoDataMessage>
            {selectedTransferId 
              ? `No evidence uploaded for the selected transfer yet` 
              : 'No evidence uploaded yet'
            }
          </NoDataMessage>
        )}
      </Section>

      {showUploadModal && selectedRequirement && (
        <UploadEvidenceModal
          requirement={selectedRequirement}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {showAuditModal && selectedRequirement && (
        <AuditTrailModal
          requirement={selectedRequirement}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {showEvidencePreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }} onClick={() => setShowEvidencePreview(null)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#222' }}>Evidence Preview</h3>
              <button
                onClick={() => setShowEvidencePreview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                &times;
              </button>
            </div>
            
            <FilePreview>
              <FileName>{showEvidencePreview.filename}</FileName>
              <FileMeta>
                Size: {formatFileSize(showEvidencePreview.size)} | 
                Type: {showEvidencePreview.fileType} | 
                Uploaded: {new Date(showEvidencePreview.uploadedAt).toLocaleString()}
              </FileMeta>
              {showEvidencePreview.description && (
                <div style={{ marginTop: '0.5rem', color: '#333' }}>
                  <strong>Description:</strong> {showEvidencePreview.description}
                </div>
              )}
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
                File preview would be implemented here
              </div>
            </FilePreview>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default EndUserDashboard;
