import React from 'react';
import styled from 'styled-components';
import { ControlMetadata } from '../../services/controlService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
`;

const DetailsCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  color: #222;
  font-weight: 500;
`;

interface TransferDetailsProps {
  control: ControlMetadata | null;
}

const TransferDetails: React.FC<TransferDetailsProps> = ({ control }) => {
  if (!control) {
    return null;
  }

  return (
    <Container>
      <Title>Transfer Details</Title>
      <DetailsCard>
        <DetailItem>
          <DetailLabel>Application ID</DetailLabel>
          <DetailValue>{control.applicationId}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Application Name</DetailLabel>
          <DetailValue>{control.applicationName}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Control ID</DetailLabel>
          <DetailValue>{control.controlId}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Application Manager</DetailLabel>
          <DetailValue>{control.applicationManager}</DetailValue>
        </DetailItem>
      </DetailsCard>
    </Container>
  );
};

export default TransferDetails;




