import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Evidence } from '../../types/index';
import { useEvidenceApi } from '../../hooks/useEvidenceApi';
import StatusChip from '../StatusChip';

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
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

const PriorityBadge = styled.span<{ $priority: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => {
    switch (props.$priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FFA000';
      case 'low':
        return '#4CAF50';
      default:
        return '#666';
    }
  }};
  
  color: white;
`;

const EscalationSource = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}40;
`;

interface EscalatedEvidenceListProps {
  escalatedTo: string;
  onReviewClick: (evidence: Evidence) => void;
}

const EscalatedEvidenceList: React.FC<EscalatedEvidenceListProps> = ({
  escalatedTo,
  onReviewClick
}) => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const { getAllEvidence } = useEvidenceApi();

  useEffect(() => {
    const loadEscalatedEvidence = async () => {
      setLoading(true);
      try {
        const allEvidence = await getAllEvidence();
        // Filter evidence escalated to this authority
        const escalated = allEvidence.filter(e => 
          e.status === 'ESCALATED' && 
          (e.escalatedTo === escalatedTo || e.escalatedTo === escalatedTo.toLowerCase())
        );
        setEvidence(escalated);
      } catch (error) {
        console.error('Failed to load escalated evidence:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEscalatedEvidence();
  }, [getAllEvidence, escalatedTo]);

  const getPriority = (evidence: Evidence): 'high' | 'medium' | 'low' => {
    const uploadDate = new Date(evidence.uploadedAt);
    const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpload > 7) return 'high';
    if (daysSinceUpload > 3) return 'medium';
    return 'low';
  };

  const getEscalationSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      'Admin': '#FF9800',
      'Legal': '#9C27B0',
      'Business': '#2196F3',
      'DISO': '#F44336',
      'Finance': '#4CAF50',
      'Privacy': '#673AB7'
    };
    return colors[source] || '#666';
  };

  if (loading) {
    return <LoadingMessage>Loading escalated evidence...</LoadingMessage>;
  }

  if (evidence.length === 0) {
    return <NoDataMessage>No evidence escalated to {escalatedTo}</NoDataMessage>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Transfer ID</Th>
          <Th>Requirement</Th>
          <Th>Escalated By</Th>
          <Th>Escalated At</Th>
          <Th>Priority</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {evidence.map((item) => (
          <Tr key={item.id}>
            <Td>{item.requirementId}</Td>
            <Td>
              <div>
                <div style={{ fontWeight: '500' }}>{item.filename}</div>
                {item.description && (
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {item.description}
                  </div>
                )}
              </div>
            </Td>
            <Td>
              <EscalationSource $color={getEscalationSourceColor(item.escalatedBy || 'Unknown')}>
                {item.escalatedBy || 'Unknown'}
              </EscalationSource>
            </Td>
            <Td>
              {item.escalatedAt ? new Date(item.escalatedAt).toLocaleDateString() : 'N/A'}
            </Td>
            <Td>
              <PriorityBadge $priority={getPriority(item)}>
                {getPriority(item)}
              </PriorityBadge>
            </Td>
            <Td>
              <StatusChip status={item.status} />
            </Td>
            <Td>
              <Button
                variant="primary"
                onClick={() => onReviewClick(item)}
              >
                Review
              </Button>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
};

export default EscalatedEvidenceList;
