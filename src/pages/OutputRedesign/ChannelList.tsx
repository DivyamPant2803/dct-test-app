import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ListContainer = styled.div`
  max-height: 260px;
  overflow-y: auto;
  background: #f8fafc;
  border-radius: 12px;
  padding: 8px 0;
`;
const ChannelRow = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 500;
  color: ${({ selected }) => (selected ? '#111' : '#222')};
  background: ${({ selected }) => (selected ? '#ededed' : '#fff')};
  border-radius: 10px;
  margin-bottom: 6px;
  box-shadow: none;
  transition: background 0.15s;
  &:hover {
    background: #f3f3f3;
    color: #111;
  }
`;
const ChannelLabel = styled.span`
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 1.08em;
  padding-left: 12px;
`;
const MediaLabel = styled.span`
  font-weight: 700;
  color: #111;
  margin-right: 10px;
`;
const OutputChip = styled.span<{ output: string }>`
  display: inline-block;
  padding: 6px 18px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 1em;
  background: ${({ output }) =>
    output === 'Allowed' ? '#d1fae5' :
    output === 'Allowed with conditions' ? '#fef3c7' :
    output === 'Prohibited' ? '#fee2e2' : '#e5e7eb'};
  color: ${({ output }) =>
    output === 'Allowed' ? '#065f46' :
    output === 'Allowed with conditions' ? '#92400e' :
    output === 'Prohibited' ? '#991b1b' : '#222'};
  margin-left: 18px;
`;
const InfoIcon = styled.button`
  margin-left: 14px;
  background: none;
  border: none;
  color: #111;
  font-size: 1.18em;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  outline: none;
  &:focus {
    outline: 2px solid #111;
    outline-offset: 2px;
  }
`;
// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: #fff;
  color: #111;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(30,41,59,0.13);
  max-width: 540px;
  width: 92vw;
  max-height: 80vh;
  padding: 32px 28px 24px 28px;
  position: relative;
  overflow-y: auto;
`;
const ModalClose = styled.button`
  position: absolute;
  top: 16px;
  right: 18px;
  background: none;
  border: none;
  font-size: 1.5em;
  color: #888;
  cursor: pointer;
`;
const ModalTitle = styled.div`
  font-weight: 700;
  font-size: 1.15em;
  margin-bottom: 18px;
  color: #111;
`;
const ModalText = styled.div`
  color: #222;
  font-size: 1.05em;
  white-space: pre-wrap;
`;

interface ChannelListProps {
  channels: { id: string; label: string; output: string; requirements: string; mediaId?: string; mediaLabel?: string }[];
  selectedChannels: string[];
  onChannelChange: (compositeKey: string) => void;
  onShowRequirements?: (compositeKey: string) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  showMediaLabel?: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  selectedChannels,
  onChannelChange,
  showMediaLabel,
}) => {
  const [modal, setModal] = useState<{ open: boolean; requirements: string }>({ open: false, requirements: '' });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modal.open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModal({ open: false, requirements: '' });
    }
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModal({ open: false, requirements: '' });
      }
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [modal.open]);

  return (
    <ListContainer>
      {channels.map((channel) => {
        const compositeKey = `${channel.mediaId}__${channel.id}`;
        const isSelected = selectedChannels.includes(compositeKey);
        return (
          <div key={compositeKey} style={{ position: 'relative' }}>
            <ChannelRow selected={isSelected}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onChannelChange(compositeKey)}
                aria-label={channel.label}
                style={{ accentColor: isSelected ? '#111' : '#cbd5e1', width: 18, height: 18 }}
              />
              <ChannelLabel>
                {showMediaLabel && channel.mediaLabel && (
                  <MediaLabel>{channel.mediaLabel}</MediaLabel>
                )}
                {channel.label}
              </ChannelLabel>
              <OutputChip output={channel.output}>{channel.output}</OutputChip>
              {isSelected && (
                <InfoIcon
                  aria-label="Show requirements"
                  tabIndex={0}
                  onClick={() => setModal({ open: true, requirements: channel.requirements })}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setModal({ open: true, requirements: channel.requirements });
                  }}
                >
                  &#9432;
                </InfoIcon>
              )}
            </ChannelRow>
          </div>
        );
      })}
      {channels.length === 0 && <div style={{ color: '#64748b', padding: '8px 0 8px 12px' }}>No channels found.</div>}
      {modal.open && (
        <ModalOverlay>
          <ModalBox ref={modalRef} tabIndex={-1} aria-modal="true" role="dialog">
            <ModalClose onClick={() => setModal({ open: false, requirements: '' })} aria-label="Close">×</ModalClose>
            <ModalTitle>Requirements</ModalTitle>
            <ModalText>{modal.requirements}</ModalText>
          </ModalBox>
        </ModalOverlay>
      )}
    </ListContainer>
  );
};

export default ChannelList; 