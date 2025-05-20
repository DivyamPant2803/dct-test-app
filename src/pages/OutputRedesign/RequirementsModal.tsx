import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Modal = styled.div`
  background: #fff;
  border-radius: 10px;
  max-width: 540px;
  width: 90vw;
  max-height: 80vh;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.13);
  overflow-y: auto;
  position: relative;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 18px;
  background: none;
  border: none;
  font-size: 1.5em;
  color: #64748b;
  cursor: pointer;
`;
const Title = styled.div`
  font-weight: 700;
  font-size: 1.15em;
  margin-bottom: 18px;
  color: #1e293b;
`;
const RequirementsText = styled.div`
  color: #222;
  font-size: 1.05em;
  white-space: pre-wrap;
`;

interface RequirementsModalProps {
  open: boolean;
  onClose: () => void;
  requirements: string;
}

const RequirementsModal: React.FC<RequirementsModalProps> = ({ open, onClose, requirements }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
        <Title>Requirements</Title>
        <RequirementsText>{requirements}</RequirementsText>
      </Modal>
    </Overlay>
  );
};

export default RequirementsModal; 