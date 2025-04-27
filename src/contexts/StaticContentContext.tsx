import React, { createContext, useContext, useState } from 'react';

export type ContentItem = { title: string; body: string; date?: string };
export type ContentState = {
  announcements: ContentItem[];
  releasenotes: ContentItem[];
  keynotes: ContentItem[];
  training: ContentItem[];
};

const initialContent: ContentState = {
  announcements: [
    { title: 'System maintenance on April 30', body: 'The system will be down for scheduled maintenance on April 30 from 1:00 AM to 5:00 AM UTC. Please save your work and log out before this time.', date: '2024-04-25' },
    { title: 'New policy update', body: 'A new data retention policy will be effective from May 10.', date: '2024-04-20' },
    { title: 'Holiday Notice', body: 'The office will be closed on May 1 for Labor Day.', date: '2024-04-15' },
  ],
  releasenotes: [
    { title: 'v2.3.1 Released', body: 'Minor bug fixes and performance improvements. See the full changelog for details.', date: '2024-04-22' },
    { title: 'v2.3.0 Major Update', body: 'Introduced new compliance dashboard and improved reporting.', date: '2024-04-10' },
  ],
  keynotes: [
    { title: 'Updated compliance guidelines', body: 'We have updated our compliance guidelines. Please review the new documentation in the compliance portal.', date: '2024-04-18' },
  ],
  training: [
    { title: 'New user onboarding module available', body: 'A new onboarding module is now available for all users. Access it from the Training section.', date: '2024-04-12' },
    { title: 'Live Q&A session', body: 'Join our live Q&A session on April 28 to get your questions answered.', date: '2024-04-10' },
  ],
};

const StaticContentContext = createContext<{
  content: ContentState;
  setContent: React.Dispatch<React.SetStateAction<ContentState>>;
}>({
  content: initialContent,
  setContent: () => {},
});

export const useStaticContent = () => useContext(StaticContentContext);

export const StaticContentProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [content, setContent] = useState<ContentState>(initialContent);
  return (
    <StaticContentContext.Provider value={{ content, setContent }}>
      {children}
    </StaticContentContext.Provider>
  );
}; 