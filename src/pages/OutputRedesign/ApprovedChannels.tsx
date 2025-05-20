import React, { useState } from 'react';
import styled from 'styled-components';
import { dataTransferMedia } from './dataTransferMedia';
import ChannelList from './ChannelList';

const Container = styled.div`
  display: flex;
  gap: 32px;
  width: 100%;
  align-items: flex-start;
`;
const MediaList = styled.div`
  min-width: 220px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 18px 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
`;
const MediaItem = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  font-weight: 400;
  color: ${({ selected }) => (selected ? '#111' : '#222')};
  background: ${({ selected }) => (selected ? '#ededed' : '#fff')};
  border-radius: 6px;
  margin-bottom: 2px;
  &:hover {
    background:rgb(198, 198, 198);
    color:rgb(0, 0, 0);
  }
`;
const Checkbox = styled.input`
  margin-right: 10px;
`;
const ChannelPanel = styled.div`
  flex: 1;
`;

const ApprovedChannels: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<{ [mediaId: string]: string[] }>({});

  const handleMediaChange = (mediaId: string) => {
    setSelectedMedia((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  // Flatten all channels for selected media, with media context
  const allChannels = selectedMedia.flatMap((mediaId) => {
    const media = dataTransferMedia.find((m) => m.id === mediaId);
    if (!media) return [];
    return media.channels.map((channel) => ({
      ...channel,
      mediaId,
      mediaLabel: media.label,
    }));
  });

  // For selection, use a composite key: `${mediaId}__${channelId}`
  const selectedChannelKeys = selectedMedia.flatMap((mediaId) =>
    (selectedChannels[mediaId] || []).map((channelId) => `${mediaId}__${channelId}`)
  );

  const handleChannelChange = (mediaId: string, channelId: string) => {
    setSelectedChannels((prev) => {
      const prevChannels = prev[mediaId] || [];
      return {
        ...prev,
        [mediaId]: prevChannels.includes(channelId)
          ? prevChannels.filter((id) => id !== channelId)
          : [...prevChannels, channelId],
      };
    });
  };

  return (
    <Container>
      <MediaList>
        <div style={{ fontWeight: 700, marginBottom: 10, color: '#1e293b' }}>Data Transfer Media</div>
        {dataTransferMedia.map((media) => (
          <MediaItem key={media.id} selected={selectedMedia.includes(media.id)} tabIndex={0}>
            <Checkbox
              type="checkbox"
              checked={selectedMedia.includes(media.id)}
              onChange={() => handleMediaChange(media.id)}
              aria-label={media.label}
              style={{ accentColor: selectedMedia.includes(media.id) ? '#111' : '#cbd5e1', width: 18, height: 18 }}
            />
            {media.label}
          </MediaItem>
        ))}
      </MediaList>
      <ChannelPanel>
        {selectedMedia.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '1.05em', marginTop: 24 }}>Select one or more data transfer media to view channels and requirements.</div>
        ) : (
          <ChannelList
            channels={allChannels}
            selectedChannels={selectedChannelKeys}
            onChannelChange={(compositeKey) => {
              const [mediaId, channelId] = compositeKey.split('__');
              handleChannelChange(mediaId, channelId);
            }}
            searchValue={''}
            onSearchChange={() => {}}
            showMediaLabel
          />
        )}
      </ChannelPanel>
    </Container>
  );
};

export default ApprovedChannels; 