import React from 'react';
import styled from 'styled-components';

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  lineNumber?: number;
}

interface DiffViewerProps {
  originalText: string;
  proposedText: string;
  title?: string;
}

const DiffContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
`;

const DiffHeader = styled.div`
  background: #f8f8f8;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DiffTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
`;

const DiffStats = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const DiffContent = styled.div`
  display: flex;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
`;

const DiffColumn = styled.div`
  flex: 1;
  border-right: 1px solid #eee;
  
  &:last-child {
    border-right: none;
  }
`;

const ColumnHeader = styled.div`
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
`;

const DiffLine = styled.div<{ $type: 'unchanged' | 'added' | 'removed' }>`
  padding: 0.5rem 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  border-bottom: 1px solid #f0f0f0;
  white-space: pre-wrap;
  word-break: break-word;
  
  ${props => {
    switch (props.$type) {
      case 'added':
        return `
          background: #f0fff4;
          color: #166534;
          border-left: 3px solid #22c55e;
        `;
      case 'removed':
        return `
          background: #fef2f2;
          color: #dc2626;
          border-left: 3px solid #ef4444;
        `;
      default:
        return `
          background: white;
          color: #374151;
        `;
    }
  }}
`;

const LineNumber = styled.span`
  color: #9ca3af;
  margin-right: 0.75rem;
  user-select: none;
  font-size: 0.8rem;
`;

const NoChangesMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const DiffViewer: React.FC<DiffViewerProps> = ({ originalText, proposedText, title = "Requirement Text Comparison" }) => {
  // Simple line-by-line diff algorithm
  const generateDiff = (original: string, proposed: string): DiffLine[] => {
    const originalLines = original.split('\n');
    const proposedLines = proposed.split('\n');
    
    const diff: DiffLine[] = [];
    let originalIndex = 0;
    let proposedIndex = 0;
    let lineNumber = 1;
    
    while (originalIndex < originalLines.length || proposedIndex < proposedLines.length) {
      const originalLine = originalLines[originalIndex];
      const proposedLine = proposedLines[proposedIndex];
      
      if (originalIndex >= originalLines.length) {
        // Only proposed lines left
        diff.push({
          type: 'added',
          content: proposedLine,
          lineNumber: lineNumber++
        });
        proposedIndex++;
      } else if (proposedIndex >= proposedLines.length) {
        // Only original lines left
        diff.push({
          type: 'removed',
          content: originalLine,
          lineNumber: lineNumber++
        });
        originalIndex++;
      } else if (originalLine === proposedLine) {
        // Lines are identical
        diff.push({
          type: 'unchanged',
          content: originalLine,
          lineNumber: lineNumber++
        });
        originalIndex++;
        proposedIndex++;
      } else {
        // Lines are different - check if it's an addition or removal
        const nextOriginalIndex = originalIndex + 1;
        const nextProposedIndex = proposedIndex + 1;
        
        if (nextOriginalIndex < originalLines.length && originalLines[nextOriginalIndex] === proposedLine) {
          // Current original line was removed
          diff.push({
            type: 'removed',
            content: originalLine,
            lineNumber: lineNumber++
          });
          originalIndex++;
        } else if (nextProposedIndex < proposedLines.length && originalLine === proposedLines[nextProposedIndex]) {
          // Current proposed line was added
          diff.push({
            type: 'added',
            content: proposedLine,
            lineNumber: lineNumber++
          });
          proposedIndex++;
        } else {
          // Both lines changed
          diff.push({
            type: 'removed',
            content: originalLine,
            lineNumber: lineNumber++
          });
          diff.push({
            type: 'added',
            content: proposedLine,
            lineNumber: lineNumber++
          });
          originalIndex++;
          proposedIndex++;
        }
      }
    }
    
    return diff;
  };

  const diff = generateDiff(originalText, proposedText);
  
  // Calculate stats
  const addedCount = diff.filter(line => line.type === 'added').length;
  const removedCount = diff.filter(line => line.type === 'removed').length;
  const unchangedCount = diff.filter(line => line.type === 'unchanged').length;
  
  // Check if there are any changes
  const hasChanges = addedCount > 0 || removedCount > 0;

  if (!hasChanges) {
    return (
      <DiffContainer>
        <DiffHeader>
          <DiffTitle>{title}</DiffTitle>
          <DiffStats>No changes detected</DiffStats>
        </DiffHeader>
        <NoChangesMessage>
          The proposed text is identical to the original text.
        </NoChangesMessage>
      </DiffContainer>
    );
  }

  return (
    <DiffContainer>
      <DiffHeader>
        <DiffTitle>{title}</DiffTitle>
        <DiffStats>
          {removedCount} removed, {addedCount} added, {unchangedCount} unchanged
        </DiffStats>
      </DiffHeader>
      <DiffContent>
        <DiffColumn>
          <ColumnHeader>Original Text</ColumnHeader>
          {diff.map((line, index) => (
            <DiffLine key={index} $type={line.type === 'added' ? 'unchanged' : line.type}>
              {line.type !== 'added' && (
                <>
                  <LineNumber>{line.lineNumber}</LineNumber>
                  {line.content}
                </>
              )}
            </DiffLine>
          ))}
        </DiffColumn>
        <DiffColumn>
          <ColumnHeader>Proposed Text</ColumnHeader>
          {diff.map((line, index) => (
            <DiffLine key={index} $type={line.type === 'removed' ? 'unchanged' : line.type}>
              {line.type !== 'removed' && (
                <>
                  <LineNumber>{line.lineNumber}</LineNumber>
                  {line.content}
                </>
              )}
            </DiffLine>
          ))}
        </DiffColumn>
      </DiffContent>
    </DiffContainer>
  );
};

export default DiffViewer;
