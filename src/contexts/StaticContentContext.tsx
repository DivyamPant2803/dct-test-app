import React, { createContext, useContext, useState } from 'react';
import { parseHomeHtml, SectionContentItem } from '../utils/parseHomeHtml';

const StaticContentContext = createContext<{
  content: SectionContentItem[];
  setContent: React.Dispatch<React.SetStateAction<SectionContentItem[]>>;
}>({
  content: [],
  setContent: () => {},
});

export const useStaticContent = () => useContext(StaticContentContext);

export const StaticContentProvider: React.FC<{children: React.ReactNode, rawHtml: string}> = ({ children, rawHtml }) => {
  const [content, setContent] = useState<SectionContentItem[]>(parseHomeHtml(rawHtml));
  return (
    <StaticContentContext.Provider value={{ content, setContent }}>
      {children}
    </StaticContentContext.Provider>
  );
}; 