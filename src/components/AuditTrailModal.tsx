import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RequirementRow, AuditEntry, Transfer } from '../types/index';
import { useEvidenceApi } from '../hooks/useEvidenceApi';
import StatusChip from './StatusChip';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #222;
  }
`;

const Content = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-bottom: 1.5rem;
`;

const InfoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #222;
  font-size: 1rem;
`;

const InfoDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e9ecef;
  }
`;

const TimelineItem = styled.div<{ $action: string }>`
  position: relative;
  margin-bottom: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: -1.75rem;
    top: 0.5rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => {
      switch (props.$action) {
        case 'SUBMITTED':
          return '#FFA000';
        case 'REVIEWED':
          return '#2196F3';
        case 'APPROVED':
          return '#4CAF50';
        case 'REJECTED':
          return '#F44336';
        case 'ESCALATED':
          return '#9C27B0';
        default:
          return '#666';
      }
    }};
    border: 3px solid white;
    box-shadow: 0 0 0 2px #e9ecef;
  }
`;

const TimelineContent = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ActionTitle = styled.h5`
  margin: 0;
  color: #222;
  font-size: 1rem;
  font-weight: 600;
`;

const Timestamp = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const PerformedBy = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatusChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const Note = styled.div`
  font-size: 0.9rem;
  color: #333;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #e9ecef;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
`;

interface AuditTrailModalProps {
  requirement?: RequirementRow;
  transfer?: Transfer;
  onClose: () => void;
}

const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  requirement,
  transfer,
  onClose
}) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const { getAuditTrail, getTransferAuditTrail } = useEvidenceApi();

  useEffect(() => {
    const loadAuditTrail = async () => {
      setLoading(true);
      try {
        let entries: AuditEntry[] = [];
        if (transfer) {
          entries = await getTransferAuditTrail(transfer.id);
        } else if (requirement) {
          entries = await getAuditTrail(requirement.id);
        }
        setAuditEntries(entries);
      } catch (error) {
        console.error('Failed to load audit trail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (requirement || transfer) {
      loadAuditTrail();
    }
  }, [requirement, transfer, getAuditTrail, getTransferAuditTrail]);

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'SUBMITTED':
        return 'Evidence Submitted';
      case 'REVIEWED':
        return 'Under Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'ESCALATED':
        return 'Escalated';
      default:
        return action;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const entityName = transfer ? transfer.name : requirement?.name;
  const jurisdiction = transfer ? transfer.jurisdiction : requirement?.jurisdiction;
  const entity = transfer ? transfer.entity : requirement?.entity;
  const subjectType = transfer ? transfer.subjectType : requirement?.subjectType;
  const status = transfer ? (transfer.status as any) : requirement?.status;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{transfer ? 'Transfer Audit Trail' : 'Requirement Audit Trail'}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        
        <Content>
          <InfoBox>
            <InfoTitle>{entityName}</InfoTitle>
            <InfoDetails>
              <div><strong>Jurisdiction:</strong> {jurisdiction}</div>
              <div><strong>Entity:</strong> {entity}</div>
              {subjectType && <div><strong>Subject Type:</strong> {subjectType}</div>}
              <div><strong>Current Status:</strong> <StatusChip status={status} /></div>
            </InfoDetails>
          </InfoBox>

          {loading ? (
            <LoadingMessage>Loading audit trail...</LoadingMessage>
          ) : auditEntries.length > 0 ? (
            <Timeline>
              {auditEntries.map((entry) => (
                <TimelineItem key={entry.id} $action={entry.action}>
                  <TimelineContent>
                    <TimelineHeader>
                      <ActionTitle>{getActionLabel(entry.action)}</ActionTitle>
                      <Timestamp>{formatTimestamp(entry.performedAt)}</Timestamp>
                    </TimelineHeader>
                    
                    <PerformedBy>
                      <strong>Performed by:</strong> {entry.performedBy}
                    </PerformedBy>
                    
                    {entry.previousStatus && entry.newStatus && (
                      <StatusChange>
                        <StatusLabel>Status changed from:</StatusLabel>
                        <StatusChip status={entry.previousStatus} />
                        <StatusLabel>to:</StatusLabel>
                        <StatusChip status={entry.newStatus} />
                      </StatusChange>
                    )}
                    
                    {entry.note && (
                      <Note>{entry.note}</Note>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <EmptyMessage>
              No audit entries found.
            </EmptyMessage>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

export default AuditTrailModal;
