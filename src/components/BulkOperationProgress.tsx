import React from 'react';
import styled from 'styled-components';
import { BulkOperationProgress } from '../types/index';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

interface BulkOperationProgressProps {
  progress: BulkOperationProgress;
  onClose: () => void;
}

const ProgressOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ProgressContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  padding: 2rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ProgressTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: ${props => {
    if (props.$progress === 100) return '#22c55e';
    if (props.$progress >= 75) return '#3b82f6';
    if (props.$progress >= 50) return '#f59e0b';
    return '#ef4444';
  }};
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div<{ $variant?: 'success' | 'error' | 'warning' }>`
  padding: 0.75rem;
  border-radius: 6px;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return '#d1fae5';
      case 'error': return '#fee2e2';
      case 'warning': return '#fef3c7';
      default: return '#f8f9fa';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#e9ecef';
    }
  }};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const StatusMessage = styled.div<{ $status: BulkOperationProgress['status'] }>`
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'COMPLETED':
        return `
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        `;
      case 'FAILED':
        return `
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        `;
      case 'RUNNING':
        return `
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #3b82f6;
        `;
    }
  }}
`;

const ErrorList = styled.div`
  max-height: 150px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.75rem;
`;

const ErrorItem = styled.div`
  font-size: 0.8rem;
  color: #dc2626;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
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
  ` : `
    background: white;
    color: #222;
    border: 1px solid #ccc;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const BulkOperationProgressComponent: React.FC<BulkOperationProgressProps> = ({
  progress,
  onClose
}) => {
  const progressPercentage = Math.round((progress.processedItems / progress.totalItems) * 100);
  
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'COMPLETED':
        return <FiCheckCircle />;
      case 'FAILED':
        return <FiXCircle />;
      case 'RUNNING':
        return <FiClock />;
    }
  };

  const getStatusMessage = () => {
    switch (progress.status) {
      case 'COMPLETED':
        return 'Bulk reaffirmation completed successfully!';
      case 'FAILED':
        return 'Bulk reaffirmation failed. Please check the errors below.';
      case 'RUNNING':
        return 'Processing bulk reaffirmation...';
    }
  };

  const canClose = progress.status === 'COMPLETED' || progress.status === 'FAILED';

  return (
    <ProgressOverlay>
      <ProgressContainer>
        <ProgressHeader>
          <ProgressTitle>
            {getStatusIcon()}
            Bulk Reaffirmation Progress
          </ProgressTitle>
          {canClose && (
            <CloseButton onClick={onClose}>
              ×
            </CloseButton>
          )}
        </ProgressHeader>

        <StatusMessage $status={progress.status}>
          {getStatusMessage()}
        </StatusMessage>

        <ProgressBar>
          <ProgressFill $progress={progressPercentage} />
        </ProgressBar>

        <ProgressStats>
          <StatItem>
            <StatValue>{progress.processedItems}</StatValue>
            <StatLabel>Processed</StatLabel>
          </StatItem>
          <StatItem $variant="success">
            <StatValue>{progress.completedItems}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatItem>
          <StatItem $variant="error">
            <StatValue>{progress.failedItems}</StatValue>
            <StatLabel>Failed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{progress.totalItems}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatItem>
        </ProgressStats>

        {progress.errors && progress.errors.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
              Errors ({progress.errors.length})
            </h4>
            <ErrorList>
              {progress.errors.map((error, index) => (
                <ErrorItem key={index}>
                  <FiAlertCircle style={{ marginRight: '0.5rem' }} />
                  {error}
                </ErrorItem>
              ))}
            </ErrorList>
          </div>
        )}

        {canClose && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <ActionButton $variant="primary" onClick={onClose}>
              <FiCheckCircle />
              Close
            </ActionButton>
          </div>
        )}
      </ProgressContainer>
    </ProgressOverlay>
  );
};

export default BulkOperationProgressComponent;
