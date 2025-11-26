import React, { useState, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { Evidence } from '../../types/index';
import { useEvidenceApi } from '../../hooks/useEvidenceApi';
import { FormData } from '../../App';
import { getMockEntityDetails, Combination } from '../../pages/OutputRedesign/mockEntityDetails';

const AccordionSection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const AccordionHeader = styled.button<{ $isExpanded: boolean }>`
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: ${props => props.$isExpanded ? '#f8f8f8' : 'white'};
  border: none;
  border-bottom: ${props => props.$isExpanded ? '1px solid #e0e0e0' : 'none'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f8f8;
  }
`;

const AccordionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AccordionIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.2rem;
  color: #666;
  transition: transform 0.2s ease;
  transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AccordionContent = styled.div<{ $isExpanded: boolean }>`
  max-height: ${props => props.$isExpanded ? 'none' : '0'};
  overflow: ${props => props.$isExpanded ? 'visible' : 'hidden'};
  transition: max-height 0.3s ease;
`;

const TableWrapper = styled.div`
  padding: 1.5rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e5e5;
  white-space: nowrap;
  vertical-align: top;
  font-size: 0.875rem;
  
  &:first-child {
    width: 50%;
  }
  
  &:last-child {
    width: 50%;
  }
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
`;

const Tr = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const RequirementsText = styled.div`
  white-space: pre-line;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const ActionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ActionItem = styled.div`
  padding: 0.75rem;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
`;

const ActionText = styled.div`
  white-space: pre-line;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
`;

const ActionUploadSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
`;

const UploadArea = styled.div<{ $isDragOver: boolean; $hasFile: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? '#000' : props.$hasFile ? '#28a745' : '#ccc'};
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  background: ${props => props.$isDragOver ? '#f8f8f8' : props.$hasFile ? '#f0f9f0' : 'white'};
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
  
  &:hover {
    border-color: #000;
    background: #f8f8f8;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  margin-top: 0.5rem;
`;

const FileName = styled.div`
  font-weight: 500;
  color: #222;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const DescriptionInput = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: inherit;
  margin-bottom: 0.5rem;
  resize: vertical;
  min-height: 60px;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const UploadButton = styled.button<{ $disabled: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$disabled ? '#ccc' : '#000'};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #333;
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => 
    props.$status === 'UPLOADED' ? '#d4edda' :
    props.$status === 'PENDING' ? '#fff3cd' : '#f8d7da'
  };
  color: ${props => 
    props.$status === 'UPLOADED' ? '#155724' :
    props.$status === 'PENDING' ? '#856404' : '#721c24'
  };
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const NoDataMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
`;

interface TableRow {
  id: string;
  entity: string;
  country: string;
  combination: Combination;
  legalRequirements: string;
  endUserActions: string;
}

interface EvidenceUploadListProps {
  questionnaireData: Partial<FormData> | null;
  transferId: string | null;
  onEvidenceUploaded: (rowId: string, actionIndex: number, evidence: Evidence) => void;
  uploadedEvidence: Map<string, Evidence>;
}

const EvidenceUploadList: React.FC<EvidenceUploadListProps> = ({ 
  questionnaireData,
  transferId,
  onEvidenceUploaded,
  uploadedEvidence 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadStates, setUploadStates] = useState<Map<string, {
    file: File | null;
    description: string;
    isDragOver: boolean;
    isUploading: boolean;
    error: string | null;
  }>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const { uploadEvidence } = useEvidenceApi();

  const acceptedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Generate table rows from questionnaire data (similar to OutputTable)
  const tableRows = useMemo<TableRow[]>(() => {
    if (!questionnaireData) return [];

    const rows: TableRow[] = [];
    const countries = questionnaireData.countries || [];
    
    // Handle entities - could be CountryEntities object
    let entitiesByCountry: Record<string, string[]> = {};
    if (questionnaireData.entities) {
      if (Array.isArray(questionnaireData.entities)) {
        countries.forEach(country => {
          entitiesByCountry[country] = [];
        });
      } else {
        entitiesByCountry = questionnaireData.entities as Record<string, string[]>;
      }
    }

    // Handle dataSubjectType - could be categorized object or array
    let dataSubjectTypes: string[] = [];
    if (questionnaireData.dataSubjectType) {
      if (Array.isArray(questionnaireData.dataSubjectType)) {
        dataSubjectTypes = questionnaireData.dataSubjectType;
      } else {
        const categorized = questionnaireData.dataSubjectType as { CID?: string[]; ED?: string[]; Client?: string[]; Employee?: string[] };
        dataSubjectTypes = [
          ...(categorized.CID || []),
          ...(categorized.ED || []),
          ...(categorized.Client || []),
          ...(categorized.Employee || [])
        ];
      }
    }

    const recipientTypes = questionnaireData.recipientType || [];
    const informationCategories = questionnaireData.informationCategory || [];

    // Generate rows for each entity/combination
    countries.forEach(country => {
      const countryEntities = entitiesByCountry[country] || [];
      
      if (countryEntities.length === 0) {
        // If no entities, create a row with country name
        informationCategories.forEach(infoCategory => {
          dataSubjectTypes.forEach(dataSubjectType => {
            recipientTypes.forEach(recipientType => {
              const combination: Combination = {
                infoCategory,
                dataSubjectType,
                recipientType
              };
              const details = getMockEntityDetails(country, combination);
              rows.push({
                id: `${country}-${infoCategory}-${dataSubjectType}-${recipientType}`,
                entity: country,
                country: country,
                combination,
                legalRequirements: details.legalBusinessRequirements || '—',
                endUserActions: details.endUserActions || '—'
              });
            });
          });
        });
      } else {
        countryEntities.forEach(entity => {
          informationCategories.forEach(infoCategory => {
            dataSubjectTypes.forEach(dataSubjectType => {
              recipientTypes.forEach(recipientType => {
                const combination: Combination = {
                  infoCategory,
                  dataSubjectType,
                  recipientType
                };
                const details = getMockEntityDetails(entity, combination);
                rows.push({
                  id: `${entity}-${infoCategory}-${dataSubjectType}-${recipientType}`,
                  entity: entity,
                  country: country,
                  combination,
                  legalRequirements: details.legalBusinessRequirements || '—',
                  endUserActions: details.endUserActions || '—'
                });
              });
            });
          });
        });
      }
    });

    return rows;
  }, [questionnaireData]);

  // Extract individual actions from endUserActions text
  const extractActions = (endUserActionsText: string): string[] => {
    if (!endUserActionsText || endUserActionsText === '—') return [];
    
    // Split by lines starting with "-"
    const lines = endUserActionsText.split('\n');
    const actions: string[] = [];
    let currentAction = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        if (currentAction) {
          actions.push(currentAction.trim());
        }
        currentAction = trimmed.substring(1).trim();
      } else if (trimmed && currentAction) {
        currentAction += ' ' + trimmed;
      }
    }
    
    if (currentAction) {
      actions.push(currentAction.trim());
    }
    
    return actions.length > 0 ? actions : [endUserActionsText];
  };

  const getUploadState = (rowId: string, actionIndex: number) => {
    const key = `${rowId}-${actionIndex}`;
    return uploadStates.get(key) || {
      file: null,
      description: '',
      isDragOver: false,
      isUploading: false,
      error: null
    };
  };

  const setUploadState = (rowId: string, actionIndex: number, updates: Partial<typeof uploadStates extends Map<any, infer V> ? V : never>) => {
    const key = `${rowId}-${actionIndex}`;
    setUploadStates(prev => {
      const newMap = new Map(prev);
      const current = getUploadState(rowId, actionIndex);
      newMap.set(key, { ...current, ...updates });
      return newMap;
    });
  };

  const handleFileSelect = (rowId: string, actionIndex: number, file: File) => {
    setUploadState(rowId, actionIndex, { error: null });
    
    if (!acceptedFileTypes.includes(file.type)) {
      setUploadState(rowId, actionIndex, { error: 'Please select a PDF, DOC, or XLS file' });
      return;
    }
    
    if (file.size > maxFileSize) {
      setUploadState(rowId, actionIndex, { error: 'File size must be less than 10MB' });
      return;
    }
    
    setUploadState(rowId, actionIndex, { file });
  };

  const handleFileInputChange = (rowId: string, actionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(rowId, actionIndex, file);
    }
  };

  const handleDrop = (rowId: string, actionIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(rowId, actionIndex, { isDragOver: false });
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(rowId, actionIndex, file);
    }
  };

  const handleDragOver = (rowId: string, actionIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(rowId, actionIndex, { isDragOver: true });
  };

  const handleDragLeave = (rowId: string, actionIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(rowId, actionIndex, { isDragOver: false });
  };

  const handleUpload = async (row: TableRow, actionIndex: number, actionText: string) => {
    const state = getUploadState(row.id, actionIndex);
    
    if (!state.file) {
      setUploadState(row.id, actionIndex, { error: 'Please select a file to upload' });
      return;
    }
    
    if (!state.description.trim()) {
      setUploadState(row.id, actionIndex, { error: 'Please provide a description' });
      return;
    }
    
    setUploadState(row.id, actionIndex, { isUploading: true, error: null });
    
    try {
      // Include transferId in requirementId to link evidence to transfer
      const requirementId = transferId 
        ? `req-${transferId}-${row.id}-action-${actionIndex}-${Date.now()}`
        : `req-${row.id}-action-${actionIndex}-${Date.now()}`;
      const evidence = await uploadEvidence(
        state.file,
        requirementId,
        state.description,
        row.entity,
        row.country,
        actionText
      );
      onEvidenceUploaded(row.id, actionIndex, evidence);
      setUploadState(row.id, actionIndex, { 
        file: null, 
        description: '', 
        isUploading: false 
      });
    } catch (error) {
      setUploadState(row.id, actionIndex, { 
        isUploading: false, 
        error: 'Failed to upload file. Please try again.' 
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Count total actions and uploaded evidence
  const totalActions = tableRows.reduce((sum, row) => {
    const actions = extractActions(row.endUserActions);
    return sum + actions.length;
  }, 0);

  const uploadedCount = Array.from(uploadedEvidence.keys()).length;
  const allUploaded = totalActions > 0 && uploadedCount >= totalActions;

  return (
    <AccordionSection>
      <AccordionHeader 
        $isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AccordionTitle>
          Evidence Uploads {allUploaded && '✓'} ({uploadedCount}/{totalActions})
        </AccordionTitle>
        <AccordionIcon $isExpanded={isExpanded}>▼</AccordionIcon>
      </AccordionHeader>
      <AccordionContent $isExpanded={isExpanded}>
        <TableWrapper>
          {!questionnaireData ? (
            <NoDataMessage>Complete the questionnaire to see requirements and end user actions.</NoDataMessage>
          ) : tableRows.length === 0 ? (
            <NoDataMessage>No data available for the selected questionnaire options.</NoDataMessage>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Legal Requirements</Th>
                  <Th>End User Actions</Th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => {
                  const actions = extractActions(row.endUserActions);
                  
                  return (
                    <Tr key={row.id}>
                      <Td>
                        <RequirementsText>
                          {row.legalRequirements}
                        </RequirementsText>
                      </Td>
                      <Td>
                        <ActionsContainer>
                          {actions.map((action, actionIndex) => {
                            const evidenceKey = `${row.id}-${actionIndex}`;
                            const evidence = uploadedEvidence.get(evidenceKey);
                            const isUploaded = !!evidence;
                            const state = getUploadState(row.id, actionIndex);

                            return (
                              <ActionItem key={actionIndex}>
                                <ActionText>{action}</ActionText>
                                {isUploaded ? (
                                  <>
                                    <StatusBadge $status="UPLOADED">Uploaded</StatusBadge>
                                    <FileInfo>
                                      <FileName>✓ {evidence.filename}</FileName>
                                      <FileSize>Uploaded on {new Date(evidence.uploadedAt).toLocaleDateString()}</FileSize>
                                    </FileInfo>
                                  </>
                                ) : (
                                  <ActionUploadSection>
                                    <UploadArea
                                      $isDragOver={state.isDragOver}
                                      $hasFile={!!state.file}
                                      onClick={() => {
                                        const input = fileInputRefs.current.get(`${row.id}-${actionIndex}`);
                                        input?.click();
                                      }}
                                      onDrop={(e) => handleDrop(row.id, actionIndex, e)}
                                      onDragOver={(e) => handleDragOver(row.id, actionIndex, e)}
                                      onDragLeave={(e) => handleDragLeave(row.id, actionIndex, e)}
                                    >
                                      {state.file ? (
                                        <div>
                                          <div>✓ File selected</div>
                                          <FileInfo>
                                            <FileName>{state.file.name}</FileName>
                                            <FileSize>{formatFileSize(state.file.size)}</FileSize>
                                          </FileInfo>
                                        </div>
                                      ) : (
                                        <div>
                                          <div style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>📁</div>
                                          <div style={{ fontSize: '0.85rem' }}>Click to select file or drag and drop</div>
                                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                                            PDF, DOC, XLS files only (max 10MB)
                                          </div>
                                        </div>
                                      )}
                                    </UploadArea>
                                    <FileInput
                                      ref={(el) => {
                                        if (el) fileInputRefs.current.set(`${row.id}-${actionIndex}`, el);
                                      }}
                                      type="file"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                                      onChange={(e) => handleFileInputChange(row.id, actionIndex, e)}
                                    />
                                    <DescriptionInput
                                      placeholder="Provide a brief description of the evidence..."
                                      value={state.description}
                                      onChange={(e) => setUploadState(row.id, actionIndex, { description: e.target.value })}
                                    />
                                    <UploadButton
                                      $disabled={!state.file || !state.description.trim() || state.isUploading}
                                      onClick={() => handleUpload(row, actionIndex, action)}
                                    >
                                      {state.isUploading ? 'Uploading...' : 'Upload Evidence'}
                                    </UploadButton>
                                    {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
                                  </ActionUploadSection>
                                )}
                              </ActionItem>
                            );
                          })}
                        </ActionsContainer>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TableWrapper>
      </AccordionContent>
    </AccordionSection>
  );
};

export default EvidenceUploadList;
