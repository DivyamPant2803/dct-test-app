import React, { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { FiFileText, FiUpload, FiZap } from 'react-icons/fi';
import { exportOutputToExcel } from './exportOutputToExcel';
import { getMockEntityDetails } from './mockEntityDetails';
import { getMockAzureHostingLocations, getMockAccessLocations } from './EntityDetailPanel';
import TableFilterBar, { FilterOption } from './TableFilterBar';
import EvidenceUploadSidebar from '../../components/EvidenceUploadSidebar';
import SimplifyPopover from '../../components/SimplifyPopover';

const TableContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
`;

const TableHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  color: #555;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #d1d5db;
    color: #374151;
  }
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #e5e5e5;
  white-space: nowrap;
  vertical-align: top;
  font-size: 0.875rem;

  &:nth-child(1) { width: 16%; } /* Entity Name */
  &:nth-child(2) { width: 14%; } /* Country */
  &:nth-child(3) { width: 10%; } /* Output */
  &:nth-child(4) { width: 20%; } /* Legal Requirements */
  &:nth-child(5) { width: 20%; } /* End User Actions */
  &:nth-child(6) { width: 12%; } /* Remediation */
  &:nth-child(7) { width: 10%; } /* Contact Person */
  &:nth-child(8) { width: 10%; } /* Date Generated */
  &:nth-child(9) { width: 12%; } /* Upload Evidence */
  &:nth-child(10) { width: 15%; } /* Locations */
`;

const Td = styled.td`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  color: #4b5563;
  white-space: normal;
  word-break: break-word;
  vertical-align: top;
  line-height: 1.5;
  font-size: 0.875rem;
  height: 60px;
  max-height: 60px;
  overflow: hidden;
  text-align: left;
`;

const Tr = styled.tr<{ isExpanded?: boolean }>`
  background: ${({ isExpanded }) => isExpanded ? '#f8f9fa' : 'white'};
  transition: background-color 0.2s ease;
  height: 60px;
  max-height: 60px;
  overflow: hidden;
  &:hover {
    background: ${({ isExpanded }) => isExpanded ? '#f1f5f9' : '#f9fafb'};
  }
`;

const ExpandableTd = styled.td<{ isExpanded?: boolean; expandedWidth?: string }>`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  color: #4b5563;
  vertical-align: top;
  line-height: 1.5;
  font-size: 0.875rem;
  height: 60px;
  max-height: 60px;
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;
  text-align: left;
  width: ${({ isExpanded, expandedWidth }) => isExpanded && expandedWidth ? expandedWidth : 'auto'};
  min-width: ${({ isExpanded, expandedWidth }) => isExpanded && expandedWidth ? expandedWidth : 'auto'};
`;

// const ExpandableContent = styled.div<{ isExpanded?: boolean }>`
//   display: flex;
//   align-items: flex-start;
//   gap: 0.75rem;
//   cursor: pointer;
//   transition: all 0.2s ease;
//
//   &:hover {
//     color: #1f2937;
//   }
// `;

// const ExpandIcon = styled.div<{ isExpanded?: boolean }>`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 20px;
//   height: 20px;
//   color: #6b7280;
//   transition: transform 0.2s ease;
//   transform: ${({ isExpanded }) => isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
//   flex-shrink: 0;
//   margin-top: 2px;
// `;

// const ContentPreview = styled.div<{ isExpanded?: boolean }>`
//   flex: 1;
//   overflow: ${({ isExpanded }) => isExpanded ? 'visible' : 'hidden'};
//   text-overflow: ${({ isExpanded }) => isExpanded ? 'clip' : 'ellipsis'};
//   white-space: ${({ isExpanded }) => isExpanded ? 'normal' : 'nowrap'};
// `;

// const ExpandedContent = styled.div`
//   margin-top: 0.75rem;
//   padding: 1rem;
//   background: white;
//   border-radius: 8px;
//   border: 1px solid #e5e5e5;
//   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
// `;

const ContentList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ContentItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const OutputChip = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  color: #fff;
  background: ${({ type }) =>
    type === 'OK' ? '#10b981' :
    type === 'OKC' ? '#f59e0b' :
    type === 'NOK' ? '#ef4444' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const StatusChip = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) =>
    status === 'Approved' ? '#d1fae5' : 
    status === 'Approved with predefined conditions' ? '#fef3c7' : '#fee2e2'};
  color: ${({ status }) =>
    status === 'Approved' ? '#065f46' : 
    status === 'Approved with predefined conditions' ? '#92400e' : '#991b1b'};
  white-space: normal;
  word-break: break-word;
  text-align: left;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  padding: 2rem;
  min-width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalClose = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  z-index: 1100;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }
`;

const LocationLink = styled.button`
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #eff6ff;
    color: #2563eb;
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: white;
  color: #555;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 80px;
  justify-content: center;

  &:hover {
    background: #f8f9fa;
    border-color: #222;
    color: #222;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SectionTitle = styled.h3`
  margin: 1.5rem 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const OverlayCard = styled.div`
  position: fixed;
  z-index: 2000;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border-radius: 12px;
  min-width: 420px;
  max-width: 600px;
  padding: 2rem 2.5rem;
  max-height: 70vh;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
`;

const OverlayBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1999;
  background: transparent;
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2000;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  border-radius: 10px;
  min-width: 240px;
  max-width: fit-content;
  padding: 1.1rem 1.3rem 1.1rem 1.1rem;
  max-height: 40vh;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  font-size: 0.97rem;
  color: #222;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  text-align: left;
`;

const PopoverCopyBtn = styled.button`
  align-self: flex-end;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.95em;
  color: #334155;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: #e0e7ef;
  }
`;

const SimplifyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #6366f1;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85em;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  margin-right: 0.5rem;
  
  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }
`;

const PopoverActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
`;

const ExpandableSimplifyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  margin-left: 0.5rem;
  
  &:hover {
    background: #4f46e5;
  }
`;

interface OutputTableProps {
  selectedBusinessDivision: string | null;
  selectedInfoCategory: string | null;
  selectedGuidance: string | null;
  selectedRecipientTypes: string | null;
  selectedDataSubjectType: string | null;
  selectedPurpose: string | null;
  selectedTransferLocation: string | null;
  entities: { id: string, name: string, country?: string[] }[];
}

const OutputTable: React.FC<OutputTableProps> = ({
  selectedBusinessDivision,
  selectedInfoCategory,
  selectedGuidance,
  selectedRecipientTypes,
  selectedDataSubjectType,
  // selectedPurpose,
  // selectedTransferLocation,
  entities
}) => {
  const [modalEntity, setModalEntity] = useState<string | null>(null);
  const [expandedRowId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<{
    entityId: string;
    column: string;
    content: string[];
    anchor: { top: number; left: number; width: number; height: number } | null;
  } | null>(null);
  const [popover, setPopover] = useState<{
    entityId: string;
    column: string;
    content: string;
    anchor: { top: number; left: number; width: number; height: number } | null;
  } | null>(null);
  const [evidenceUploadSidebar, setEvidenceUploadSidebar] = useState<{
    entityName: string;
    country: string;
    legalRequirement: string;
  } | null>(null);
  const [simplifyPopover, setSimplifyPopover] = useState<{
    requirementId: string;
    originalText: string;
  } | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});

  // Show Azure Hosting/Access Locations logic (same as detail panel)
  const showAzureHostingLocations =
    selectedGuidance === 'Business Guidance' &&
    selectedInfoCategory === 'CID' &&
    selectedRecipientTypes === 'Service Provider' &&
    (selectedBusinessDivision === 'P&C' || selectedBusinessDivision === 'GWM');

  const tableData = useMemo(() => {
    return entities.map(entity => {
      const details = getMockEntityDetails(entity.id, {
        infoCategory: selectedInfoCategory || undefined,
        dataSubjectType: selectedDataSubjectType || undefined,
        recipientType: selectedRecipientTypes || undefined,
      });
      return {
        entityId: entity.id,
        entityName: entity.name,
        country: Array.isArray(entity.country) ? entity.country.join(', ') : (entity.country || '--'),
        output: details.output || '--',
        legalRequirements: details.legalBusinessRequirements ? [details.legalBusinessRequirements] : [],
        endUserActions: details.endUserActions ? [details.endUserActions] : [],
        remediation: details.remediation ? [details.remediation] : [],
        contactPerson: details.contactPerson || '--',
        dateGenerated: details.dateGenerated || '--',
      };
    });
  }, [entities, selectedInfoCategory, selectedDataSubjectType, selectedRecipientTypes]);

  const handleExportExcel = () => {
    const outputData = tableData.map(row => ({
      'Entity Name': row.entityName,
      'Output': row.output,
      'Legal Requirements': row.legalRequirements.join('\n'),
      'End User Actions': row.endUserActions.join('\n'),
      'Remediation': row.remediation.join('\n'),
      'Contact Person': row.contactPerson,
      'Date Generated': row.dateGenerated,
    }));

    exportOutputToExcel(
      outputData,
      [], // Azure Cloud Hosting data
      [], // Access Locations data
      [], // Approved Channels data
      'output_table'
    );
  };

  // const handleRowExpand = (entityId: string) => {
  //   setExpandedRowId(prev => (prev === entityId ? null : entityId));
  // };

  const shouldShowExpandButton = (content: string[]) => {
    return content.length > 0 && content.some(item => item.length > 100);
  };

  // const openOverlay = (entityId: string, column: string, content: string[]) => {
  //   // Find the cell position
  //   const key = `${entityId}-${column}`;
  //   const cell = cellRefs.current[key];
  //   if (cell) {
  //     const rect = cell.getBoundingClientRect();
  //     setOverlay({
  //       entityId,
  //       column,
  //       content,
  //       anchor: {
  //         top: rect.top + window.scrollY,
  //         left: rect.left + window.scrollX,
  //         width: rect.width,
  //         height: rect.height,
  //       },
  //     });
  //   }
  // };

  const closeOverlay = () => setOverlay(null);

  const handlePopoverShow = (entityId: string, column: string, content: string) => {
    const key = `${entityId}-${column}`;
    const cell = cellRefs.current[key];
    if (cell) {
      const rect = cell.getBoundingClientRect();
      setPopover({
        entityId,
        column,
        content,
        anchor: {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        },
      });
    }
  };

  const handlePopoverHide = () => setPopover(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUploadClick = (row: any) => {
    setEvidenceUploadSidebar({
      entityName: row.entityName,
      country: row.country,
      legalRequirement: row.legalRequirements
    });
  };

  const handleUploadSuccess = () => {
    // Could show a success message or refresh data
    console.log('Evidence uploaded successfully');
  };

  const handleSimplifyClick = (requirementId: string, originalText: string) => {
    setSimplifyPopover({
      requirementId,
      originalText
    });
  };

  const renderPreviewCell = (content: string[], entityId: string, columnType: string) => {
    const key = `${entityId}-${columnType}`;
    const shouldExpand = shouldShowExpandButton(content);
    if (content.length === 0) {
      return <span style={{ color: '#9ca3af' }}>—</span>;
    }
    if (!shouldExpand) {
      return content.join(', ');
    }
    return (
      <div
        ref={el => { cellRefs.current[key] = el as HTMLTableCellElement | null; }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100px',
          display: 'block',
        }}
        onMouseEnter={() => handlePopoverShow(entityId, columnType, content[0])}
        onMouseLeave={handlePopoverHide}
      >
        <div style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'normal',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.2',
          fontSize: '0.98em',
          cursor: 'pointer',
          margin: 0,
          padding: 0,
        }}>{content[0]}</div>
      </div>
    );
  };

  // const renderCollapsedCell = (content: string[], entityId: string, columnType: string) => {
  //   const shouldExpand = shouldShowExpandButton(content);
  //   if (content.length === 0) {
  //     return <span style={{ color: '#9ca3af' }}>—</span>;
  //   }
  //   if (!shouldExpand) {
  //     return content.join(', ');
  //   }
  //   return (
  //     <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleRowExpand(entityId); }}>
  //       <ExpandIcon isExpanded={expandedRowId === entityId}>
  //         <FiChevronRight size={16} />
  //       </ExpandIcon>
  //       <div style={{
  //         width: '100%',
  //         height: '100%',
  //         overflow: 'hidden',
  //         textOverflow: 'ellipsis',
  //         whiteSpace: 'normal',
  //         display: '-webkit-box',
  //         WebkitLineClamp: 4,
  //         WebkitBoxOrient: 'vertical',
  //         lineHeight: '1.4',
  //       }}>{content[0]}</div>
  //     </div>
  //   );
  // };

  const renderExpandedRow = (row: any, columnCount: number) => (
    <tr>
      <td colSpan={columnCount} style={{ background: '#f8f9fa', padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <strong>Legal Requirements</strong>
            <ContentList>
              {row.legalRequirements.length > 0 ? row.legalRequirements.map((item: string, idx: number) => (
                <ContentItem key={idx}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span style={{ flex: 1 }}>{item}</span>
                    <ExpandableSimplifyButton 
                      onClick={() => handleSimplifyClick(`${row.entityId}-${idx}`, item)}
                    >
                      <FiZap size={10} />
                      Simplify
                    </ExpandableSimplifyButton>
                  </div>
                </ContentItem>
              )) : <ContentItem>—</ContentItem>}
            </ContentList>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <strong>End User Actions</strong>
            <ContentList>
              {row.endUserActions.length > 0 ? row.endUserActions.map((item: string, idx: number) => (
                <ContentItem key={idx}>{item}</ContentItem>
              )) : <ContentItem>—</ContentItem>}
            </ContentList>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <strong>Remediation</strong>
            <ContentList>
              {row.remediation.length > 0 ? row.remediation.map((item: string, idx: number) => (
                <ContentItem key={idx}>{item}</ContentItem>
              )) : <ContentItem>—</ContentItem>}
            </ContentList>
          </div>
        </div>
      </td>
    </tr>
  );

  const [entityNameFilter, setEntityNameFilter] = useState<FilterOption[]>([]);
  const [countryFilter, setCountryFilter] = useState<FilterOption[]>([]);
  const [outputFilter, setOutputFilter] = useState<FilterOption[]>([]);

  const entityNameOptions = useMemo(() => {
    const names = Array.from(new Set(tableData.map(row => row.entityName)));
    return names.map(name => ({ value: name, label: name }));
  }, [tableData]);

  const countryOptions = useMemo(() => {
    const countries = Array.from(new Set(tableData.map(row => row.country)));
    return countries.map(c => ({ value: c, label: c }));
  }, [tableData]);

  const outputOptions = [
    { value: 'OK', label: 'OK' },
    { value: 'OKC', label: 'OKC' },
    { value: 'NOK', label: 'NOK' },
  ];

  const filteredTableData = useMemo(() => {
    return tableData.filter(row => {
      const entityMatch = entityNameFilter.length === 0 || entityNameFilter.some(f => f.value === row.entityName);
      const countryMatch = countryFilter.length === 0 || countryFilter.some(f => f.value === row.country);
      const outputMatch = outputFilter.length === 0 || outputFilter.some(f => f.value === row.output);
      return entityMatch && countryMatch && outputMatch;
    });
  }, [tableData, entityNameFilter, countryFilter, outputFilter]);

  return (
    <TableContainer>
      <TableHeader>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>Output</h3>
        <ExportButtonsContainer>
          <ExportButton onClick={handleExportExcel}>
            <FiFileText size={16} />
            Export to Excel
          </ExportButton>
        </ExportButtonsContainer>
      </TableHeader>
      {/* Filter Bar */}
      <TableFilterBar
        entityNameOptions={entityNameOptions}
        countryOptions={countryOptions}
        outputOptions={outputOptions}
        entityNameFilter={entityNameFilter}
        countryFilter={countryFilter}
        outputFilter={outputFilter}
        onEntityNameFilterChange={setEntityNameFilter}
        onCountryFilterChange={setCountryFilter}
        onOutputFilterChange={setOutputFilter}
      />
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Entity Name</Th>
              <Th>Country</Th>
              <Th>Output</Th>
              <Th>Legal Requirements</Th>
              <Th>End User Actions</Th>
              <Th>Remediation</Th>
              <Th>Contact Person</Th>
              <Th>Date Generated</Th>
              <Th>Upload Evidence</Th>
              {showAzureHostingLocations && <Th>Locations</Th>}
            </tr>
          </thead>
          <tbody>
            {filteredTableData.map((row, _index) => {
              const isExpanded = expandedRowId === row.entityId;
              
              return (
                <React.Fragment key={row.entityId}>
                  <Tr isExpanded={isExpanded}>
                    <Td>{row.entityName}</Td>
                    <Td>{row.country}</Td>
                    <Td>
                      <OutputChip type={row.output}>{row.output}</OutputChip>
                    </Td>
                    <ExpandableTd
                      ref={el => { cellRefs.current[`${row.entityId}-legal`] = el; }}
                      isExpanded={isExpanded}
                    >
                      {renderPreviewCell(row.legalRequirements, row.entityId, 'legal')}
                    </ExpandableTd>
                    <ExpandableTd
                      ref={el => { cellRefs.current[`${row.entityId}-actions`] = el; }}
                      isExpanded={isExpanded}
                    >
                      {renderPreviewCell(row.endUserActions, row.entityId, 'actions')}
                    </ExpandableTd>
                    <ExpandableTd
                      ref={el => { cellRefs.current[`${row.entityId}-remediation`] = el; }}
                      isExpanded={isExpanded}
                    >
                      {renderPreviewCell(row.remediation, row.entityId, 'remediation')}
                    </ExpandableTd>
                    <Td>{row.contactPerson}</Td>
                    <Td>{row.dateGenerated}</Td>
                    <Td>
                      {row.legalRequirements && row.legalRequirements.length > 0 && row.legalRequirements[0] !== '-' ? (
                        <UploadButton onClick={() => handleUploadClick(row)}>
                          <FiUpload size={14} />
                          Upload
                        </UploadButton>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>-</span>
                      )}
                    </Td>
                    {showAzureHostingLocations && (
                      <Td>
                        <LocationLink onClick={() => setModalEntity(row.entityId)} title="View Locations">
                          View
                        </LocationLink>
                      </Td>
                    )}
                  </Tr>
                  {isExpanded && renderExpandedRow(row, showAzureHostingLocations ? 10 : 9)}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>

        {/* Modal for Locations */}
        {modalEntity && (
          <ModalOverlay onClick={() => setModalEntity(null)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalClose onClick={() => setModalEntity(null)} title="Close">×</ModalClose>
              <SectionTitle>Azure Cloud Hosting Locations</SectionTitle>
              <Table>
                <thead>
                  <tr>
                    <Th>Region</Th>
                    <Th>Approval Status</Th>
                    <Th>Conditions</Th>
                  </tr>
                </thead>
                <tbody>
                  {getMockAzureHostingLocations(modalEntity).map((loc: { region: string; approvalStatus: string; conditions?: string }, _idx: number) => (
                    <Tr key={modalEntity + loc.region}>
                      <Td>{loc.region}</Td>
                      <Td><StatusChip status={loc.approvalStatus}>{loc.approvalStatus}</StatusChip></Td>
                      <Td>{loc.approvalStatus === 'Approved with predefined conditions' ? loc.conditions : <span style={{ color: '#9ca3af' }}>—</span>}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              <SectionTitle>Access Locations</SectionTitle>
              <Table>
                <thead>
                  <tr>
                    <Th>Country</Th>
                    <Th>Business Division</Th>
                    <Th>Exposure Allowed To</Th>
                  </tr>
                </thead>
                <tbody>
                  {getMockAccessLocations(modalEntity, selectedBusinessDivision ?? null).map((rec: { country: string; businessDivision: string; exposureAllowedTo: string[] }, idx: number) => (
                    <Tr key={modalEntity + rec.country + idx}>
                      <Td>{rec.country}</Td>
                      <Td>{rec.businessDivision}</Td>
                      <Td>{rec.exposureAllowedTo && rec.exposureAllowedTo.length > 0 ? rec.exposureAllowedTo.join(', ') : <span style={{ color: '#9ca3af' }}>—</span>}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </ModalContent>
          </ModalOverlay>
        )}

        {overlay && overlay.anchor && (
          <>
            <OverlayBackdrop onClick={closeOverlay} />
            <OverlayCard style={{
              top: overlay.anchor.top + overlay.anchor.height + 8,
              left: overlay.anchor.left,
              position: 'absolute',
            }}>
              <ModalClose onClick={closeOverlay} title="Close">×</ModalClose>
              <ContentList>
                {overlay.content.map((item, idx) => (
                  <ContentItem key={idx}>{item}</ContentItem>
                ))}
              </ContentList>
            </OverlayCard>
          </>
        )}

        {popover && popover.anchor && (
          <Popover
            style={{
              top: popover.anchor.height,
              left: popover.anchor.left,
              minWidth: Math.max(240, Math.min(popover.anchor.width, 380)),
              position: 'absolute',
            }}
            onMouseEnter={() => handlePopoverShow(popover.entityId, popover.column, popover.content)}
            onMouseLeave={handlePopoverHide}
          >
            <div style={{ whiteSpace: 'pre-line' }}>{popover.content}</div>
            <PopoverActions>
              {popover.column === 'legal' && (
                <SimplifyButton 
                  onClick={() => handleSimplifyClick(popover.entityId, popover.content)}
                >
                  <FiZap size={12} />
                  Simplify
                </SimplifyButton>
              )}
              <PopoverCopyBtn onClick={() => handleCopy(popover.content)}>Copy</PopoverCopyBtn>
            </PopoverActions>
          </Popover>
        )}
      </TableWrapper>

      {evidenceUploadSidebar && (
        <EvidenceUploadSidebar
          entityName={evidenceUploadSidebar.entityName}
          country={evidenceUploadSidebar.country}
          legalRequirement={evidenceUploadSidebar.legalRequirement}
          onClose={() => setEvidenceUploadSidebar(null)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {simplifyPopover && (
        <SimplifyPopover
          requirementId={simplifyPopover.requirementId}
          originalText={simplifyPopover.originalText}
          onClose={() => setSimplifyPopover(null)}
        />
      )}
    </TableContainer>
  );
};

export default OutputTable; 