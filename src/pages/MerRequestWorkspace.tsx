import React from 'react';
import { useNavigate } from 'react-router-dom';
import MerWorkflowLayout from '../features/merWorkflow/MerWorkflowLayout';

const MerRequestWorkspace: React.FC = () => {
  const navigate = useNavigate();
  return (
    <MerWorkflowLayout
      variant="my-transfers"
      pageTitle="New MER request"
      onNavigateBack={() => navigate('/my-transfers')}
      onAfterSubmitSuccess={() => navigate('/my-transfers')}
    />
  );
};

export default MerRequestWorkspace;
