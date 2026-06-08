import React, { useState, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUpload, FiFile, FiCheck, FiX, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import { Evidence } from '../../types/index';
import { FormData } from '../../App';
import { useEvidenceApi } from '../../hooks/useEvidenceApi';
import { getMockEntityDetails, Combination } from '../../pages/OutputRedesign/mockEntityDetails';
import { colors, spacing, borderRadius } from '../../styles/designTokens';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.neutral.gray50};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProgressLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const ProgressSub = styled.div`
  font-size: 0.78rem;
  color: ${colors.text.secondary};
`;

const ProgressBarWrapper = styled.div`
  flex: 1;
  max-width: 200px;
  margin-left: ${spacing.lg};
`;

const ProgressBar = styled.div`
  height: 6px;
  background: ${colors.neutral.gray200};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: ${props =>
    props.$percent === 100 ? colors.semantic.success : colors.status.underReview
  };
  border-radius: 3px;
  transition: width 0.4s ease;
`;

const DropZone = styled.div<{ $isDragOver: boolean }>`
  border: 2px dashed ${props => props.$isDragOver ? colors.status.underReview : colors.neutral.gray300};
  border-radius: ${borderRadius.lg};
  padding: ${spacing['2xl']};
  text-align: center;
  cursor: pointer;
  background: ${props => props.$isDragOver ? `${colors.status.underReview}06` : 'white'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.status.underReview};
    background: ${`${colors.status.underReview}04`};
  }

  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const DropIcon = styled.div`
  font-size: 2.5rem;
  color: ${colors.status.underReview};
  margin-bottom: ${spacing.md};
  opacity: 0.8;
`;

const DropText = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
`;

const DropHint = styled.div`
  font-size: 0.8rem;
  color: ${colors.text.tertiary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const GlobalErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.semantic.error}08;
  border: 1px solid ${colors.semantic.error}30;
  border-radius: ${borderRadius.base};
  color: ${colors.semantic.error};
  font-size: 0.875rem;
`;

const SectionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${spacing.md};
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const RequirementCard = styled.div<{ $status: 'uploaded' | 'pending' | 'error' }>`
  border: 1px solid ${props =>
    props.$status === 'uploaded' ? `${colors.semantic.success}40` :
    props.$status === 'error' ? `${colors.semantic.error}40` :
    colors.neutral.gray200
  };
  border-radius: ${borderRadius.base};
  background: ${props =>
    props.$status === 'uploaded' ? `${colors.semantic.success}05` : 'white'
  };
  overflow: hidden;
  transition: all 0.2s ease;
`;

const RequirementHeader = styled.button<{ $isExpanded: boolean }>`
  width: 100%;
  padding: ${spacing.md} ${spacing.lg};
  background: none;
  border: none;
  border-bottom: ${props => props.$isExpanded ? `1px solid ${colors.neutral.gray100}` : 'none'};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: ${colors.background.hover};
  }
`;

const RequirementStatusIcon = styled.div<{ $status: 'uploaded' | 'pending' | 'error' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.75rem;

  ${props => {
    switch (props.$status) {
      case 'uploaded':
        return `background: ${colors.semantic.success}20; color: ${colors.semantic.success};`;
      case 'error':
        return `background: ${colors.semantic.error}20; color: ${colors.semantic.error};`;
      default:
        return `background: ${colors.neutral.gray100}; color: ${colors.text.tertiary};`;
    }
  }}
`;

const RequirementInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RequirementLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RequirementMeta = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.tertiary};
  margin-top: 2px;
`;

const ChevronIcon = styled.div<{ $isExpanded: boolean }>`
  color: ${colors.text.tertiary};
  transition: transform 0.2s;
  transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
`;

const RequirementBody = styled.div`
  padding: ${spacing.md} ${spacing.lg} ${spacing.lg};
`;

const ActionDescription = styled.div`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  line-height: 1.5;
  margin-bottom: ${spacing.md};
  padding: ${spacing.md};
  background: ${colors.neutral.gray50};
  border-radius: ${borderRadius.sm};
  border-left: 3px solid ${colors.neutral.gray300};
`;

const UploadArea = styled.div<{ $isDragOver: boolean; $hasFile: boolean }>`
  border: 2px dashed ${props =>
    props.$isDragOver ? colors.status.underReview :
    props.$hasFile ? colors.semantic.success :
    colors.neutral.gray300
  };
  border-radius: ${borderRadius.base};
  padding: ${spacing.lg};
  text-align: center;
  cursor: pointer;
  background: ${props =>
    props.$isDragOver ? `${colors.status.underReview}06` :
    props.$hasFile ? `${colors.semantic.success}06` :
    'white'
  };
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.status.underReview};
    background: ${`${colors.status.underReview}04`};
  }
`;

const DescriptionInput = styled.textarea`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  font-size: 0.875rem;
  font-family: inherit;
  color: ${colors.text.primary};
  resize: vertical;
  min-height: 72px;
  margin-top: ${spacing.md};
  margin-bottom: ${spacing.md};
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.status.underReview};
    box-shadow: 0 0 0 3px ${colors.status.underReview}15;
  }

  &::placeholder {
    color: ${colors.text.tertiary};
  }
`;

const UploadButton = styled.button<{ $disabled?: boolean }>`
  padding: ${spacing.sm} ${spacing.lg};
  background: ${props => props.$disabled ? colors.neutral.gray300 : colors.neutral.black};
  color: ${props => props.$disabled ? colors.neutral.gray500 : 'white'};
  border: none;
  border-radius: ${borderRadius.base};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${colors.neutral.gray800};
  }
`;

const SpinnerInline = styled.span`
  display: inline-block;
  animation: ${spin} 0.8s linear infinite;
`;

const UploadedFileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md};
  background: ${colors.semantic.success}08;
  border: 1px solid ${colors.semantic.success}30;
  border-radius: ${borderRadius.base};
`;

const FileIconBox = styled.div<{ $success?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: ${borderRadius.sm};
  background: ${props => props.$success ? `${colors.semantic.success}15` : `${colors.status.underReview}15`};
  color: ${props => props.$success ? colors.semantic.success : colors.status.underReview};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileMeta = styled.div`
  font-size: 0.75rem;
  color: ${colors.text.tertiary};
  margin-top: 2px;
`;

const ErrorText = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: 0.8rem;
  color: ${colors.semantic.error};
  margin-top: ${spacing.sm};
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequirementItem {
  id: string;
  label: string;
  description: string;
  entity?: string;
  country?: string;
}

interface UploadState {
  file: File | null;
  description: string;
  isDragOver: boolean;
  isUploading: boolean;
  error: string | null;
}

// ─── Helper: derive requirements from questionnaire data ─────────────────────

function deriveRequirements(questionnaireData: Partial<FormData>): RequirementItem[] {
  const items: RequirementItem[] = [];
  const countries = questionnaireData.countries || [];

  let entitiesByCountry: Record<string, string[]> = {};
  if (questionnaireData.entities) {
    if (Array.isArray(questionnaireData.entities)) {
      countries.forEach(c => { entitiesByCountry[c] = []; });
    } else {
      entitiesByCountry = questionnaireData.entities as Record<string, string[]>;
    }
  }

  let dataSubjectTypes: string[] = [];
  if (questionnaireData.dataSubjectType) {
    if (Array.isArray(questionnaireData.dataSubjectType)) {
      dataSubjectTypes = questionnaireData.dataSubjectType;
    } else {
      const c = questionnaireData.dataSubjectType as Record<string, string[]>;
      dataSubjectTypes = Object.values(c).flat();
    }
  }

  const recipientTypes = questionnaireData.recipientType || [];
  const informationCategories = questionnaireData.informationCategory || [];

  countries.forEach(country => {
    const countryEntities = entitiesByCountry[country] || [];
    const entityList = countryEntities.length > 0 ? countryEntities : [country];

    entityList.forEach(entity => {
      informationCategories.forEach(infoCategory => {
        dataSubjectTypes.forEach(dataSubjectType => {
          recipientTypes.forEach(recipientType => {
            const combination: Combination = { infoCategory, dataSubjectType, recipientType };
            const details = getMockEntityDetails(entity, combination);
            const rawActions = details.endUserActions;

            if (!rawActions || rawActions === '—') return;

            const lines = rawActions.split('\n');
            const actions: string[] = [];
            let current = '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('-')) {
                if (current) actions.push(current.trim());
                current = trimmed.slice(1).trim();
              } else if (trimmed && current) {
                current += ' ' + trimmed;
              }
            }
            if (current) actions.push(current.trim());

            const effectiveActions = actions.length > 0 ? actions : [rawActions];

            effectiveActions.forEach((action, idx) => {
              items.push({
                id: `${entity}-${infoCategory}-${dataSubjectType}-${recipientType}-${idx}`,
                label: action.length > 80 ? action.slice(0, 80) + '…' : action,
                description: action,
                entity,
                country,
              });
            });
          });
        });
      });
    });
  });

  return items;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FileManagerProps {
  isMER: boolean;
  questionnaireData?: Partial<FormData> | null;
  transferId: string | null;
  onEvidenceUploaded: (rowId: string, actionIndex: number, evidence: Evidence) => void;
  uploadedEvidence: Map<string, Evidence>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_SIZE = 10 * 1024 * 1024;

const FileManager: React.FC<FileManagerProps> = ({
  isMER,
  questionnaireData,
  transferId,
  onEvidenceUploaded,
  uploadedEvidence,
}) => {
  const [globalDragOver, setGlobalDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const globalInputRef = useRef<HTMLInputElement>(null);
  const itemInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const { uploadEvidence } = useEvidenceApi();

  const requirements = useMemo<RequirementItem[]>(() => {
    if (isMER) return [];
    if (!questionnaireData) return [];
    return deriveRequirements(questionnaireData);
  }, [isMER, questionnaireData]);

  const uploadedCount = uploadedEvidence.size;
  const totalRequired = isMER ? 0 : requirements.length;
  const progressPercent = totalRequired > 0
    ? Math.round((uploadedCount / totalRequired) * 100)
    : uploadedCount > 0 ? 100 : 0;

  const getState = (id: string): UploadState =>
    uploadStates[id] || { file: null, description: '', isDragOver: false, isUploading: false, error: null };

  const patchState = (id: string, patch: Partial<UploadState>) => {
    setUploadStates(prev => ({
      ...prev,
      [id]: { ...getState(id), ...patch },
    }));
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Unsupported file type. Use PDF, DOC, or XLS.';
    if (file.size > MAX_SIZE) return `File exceeds 10 MB limit (${formatSize(file.size)}).`;
    return null;
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setGlobalDragOver(false);
    setGlobalError(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setGlobalError(err); return; }
    // For MER: start a free-form upload entry. For non-MER: user picks which requirement.
    handleMERFileSelect(file);
  };

  // ─── MER free-form upload ─────────────────────────────────────────────────

  const [merFiles, setMerFiles] = useState<Array<{ id: string; file: File; description: string; uploading: boolean; error: string | null }>>([]);

  const handleMERFileSelect = (file: File) => {
    if (!isMER && requirements.length > 0) return; // non-MER: don't use global drop
    const err = validateFile(file);
    if (err) { setGlobalError(err); return; }
    setMerFiles(prev => [...prev, { id: `mer-${Date.now()}`, file, description: '', uploading: false, error: null }]);
  };

  const handleGlobalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setGlobalError(null);
    Array.from(files).forEach(f => handleMERFileSelect(f));
    e.target.value = '';
  };

  const uploadMERFile = async (entry: typeof merFiles[0]) => {
    if (!entry.description.trim()) {
      setMerFiles(prev => prev.map(f => f.id === entry.id ? { ...f, error: 'Please add a description.' } : f));
      return;
    }
    setMerFiles(prev => prev.map(f => f.id === entry.id ? { ...f, uploading: true, error: null } : f));
    try {
      const reqId = transferId ? `req-${transferId}-mer-${Date.now()}` : `req-mer-${Date.now()}`;
      const evidence = await uploadEvidence(entry.file, reqId, entry.description, 'MER Compliance', 'N/A', 'MER Supporting Documentation');
      onEvidenceUploaded('mer-evidence', uploadedEvidence.size, evidence);
      setMerFiles(prev => prev.filter(f => f.id !== entry.id));
    } catch {
      setMerFiles(prev => prev.map(f => f.id === entry.id ? { ...f, uploading: false, error: 'Upload failed. Please try again.' } : f));
    }
  };

  // ─── Non-MER per-requirement upload ──────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleItemFileDrop = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    patchState(id, { isDragOver: false });
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    patchState(id, err ? { error: err } : { file, error: null });
  };

  const handleItemFileInput = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    patchState(id, err ? { error: err } : { file, error: null });
    e.target.value = '';
  };

  const uploadRequirementFile = async (req: RequirementItem, idxStr: string) => {
    const state = getState(req.id);
    if (!state.file) { patchState(req.id, { error: 'Please select a file.' }); return; }
    if (!state.description.trim()) { patchState(req.id, { error: 'Please add a description.' }); return; }

    patchState(req.id, { isUploading: true, error: null });

    try {
      const reqId = transferId
        ? `req-${transferId}-${req.id}-${Date.now()}`
        : `req-${req.id}-${Date.now()}`;
      const [rowId, actionIdx] = idxStr.split('::');
      const evidence = await uploadEvidence(
        state.file,
        reqId,
        state.description,
        req.entity || '',
        req.country || '',
        req.description,
      );
      onEvidenceUploaded(rowId, parseInt(actionIdx, 10), evidence);
      patchState(req.id, { file: null, description: '', isUploading: false });
    } catch {
      patchState(req.id, { isUploading: false, error: 'Upload failed. Please try again.' });
    }
  };

  return (
    <Container>
      {/* Progress header */}
      {(totalRequired > 0 || uploadedCount > 0) && (
        <ProgressHeader>
          <ProgressInfo>
            <ProgressLabel>
              {isMER
                ? `${uploadedCount} file${uploadedCount !== 1 ? 's' : ''} uploaded`
                : `${uploadedCount} of ${totalRequired} required files uploaded`}
            </ProgressLabel>
            <ProgressSub>
              {isMER ? 'Optional supporting documents' : 'Complete all uploads before continuing'}
            </ProgressSub>
          </ProgressInfo>
          {totalRequired > 0 && (
            <ProgressBarWrapper>
              <ProgressBar role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <ProgressFill $percent={progressPercent} />
              </ProgressBar>
            </ProgressBarWrapper>
          )}
        </ProgressHeader>
      )}

      {/* Global drop zone */}
      <DropZone
        $isDragOver={globalDragOver}
        onClick={() => globalInputRef.current?.click()}
        onDrop={handleGlobalDrop}
        onDragOver={e => { e.preventDefault(); setGlobalDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setGlobalDragOver(false); }}
        tabIndex={0}
        role="button"
        aria-label="Upload files — click or drag and drop"
      >
        <DropIcon><FiUpload /></DropIcon>
        <DropText>Click to browse or drag & drop files here</DropText>
        <DropHint>PDF, DOC, DOCX, XLS, XLSX · max 10 MB each</DropHint>
        <HiddenInput
          ref={globalInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          multiple={isMER}
          onChange={handleGlobalInputChange}
        />
      </DropZone>

      {globalError && (
        <GlobalErrorBanner role="alert">
          <FiAlertCircle size={14} />
          {globalError}
        </GlobalErrorBanner>
      )}

      {/* MER: staged + uploaded files */}
      {isMER && (
        <>
          {merFiles.length > 0 && (
            <div>
              <SectionTitle>Files staged for upload ({merFiles.length})</SectionTitle>
              <RequirementsList>
                {merFiles.map(entry => (
                  <RequirementCard key={entry.id} $status="pending">
                    <RequirementHeader $isExpanded as="div" style={{ cursor: 'default' }}>
                      <RequirementStatusIcon $status="pending">
                        <FiFile size={12} />
                      </RequirementStatusIcon>
                      <RequirementInfo>
                        <RequirementLabel>{entry.file.name}</RequirementLabel>
                        <RequirementMeta>{formatSize(entry.file.size)}</RequirementMeta>
                      </RequirementInfo>
                    </RequirementHeader>
                    <RequirementBody>
                      <DescriptionInput
                        placeholder="Describe this evidence (required)…"
                        value={entry.description}
                        onChange={e => setMerFiles(prev => prev.map(f => f.id === entry.id ? { ...f, description: e.target.value } : f))}
                      />
                      <div style={{ display: 'flex', gap: spacing.sm }}>
                        <UploadButton
                          $disabled={!entry.description.trim() || entry.uploading}
                          disabled={!entry.description.trim() || entry.uploading}
                          onClick={() => uploadMERFile(entry)}
                        >
                          {entry.uploading ? <><SpinnerInline>↻</SpinnerInline> Uploading…</> : 'Upload'}
                        </UploadButton>
                        <UploadButton
                          $disabled={entry.uploading}
                          disabled={entry.uploading}
                          style={{ background: 'white', color: colors.text.secondary, border: `1px solid ${colors.neutral.gray300}` }}
                          onClick={() => setMerFiles(prev => prev.filter(f => f.id !== entry.id))}
                        >
                          Remove
                        </UploadButton>
                      </div>
                      {entry.error && (
                        <ErrorText><FiAlertCircle size={12} />{entry.error}</ErrorText>
                      )}
                    </RequirementBody>
                  </RequirementCard>
                ))}
              </RequirementsList>
            </div>
          )}

          {uploadedCount > 0 && (
            <div>
              <SectionTitle>Uploaded evidence ({uploadedCount})</SectionTitle>
              <RequirementsList>
                {Array.from(uploadedEvidence.values()).map(evidence => (
                  <UploadedFileInfo key={evidence.id}>
                    <FileIconBox $success>
                      <FiCheck size={16} />
                    </FileIconBox>
                    <FileDetails>
                      <FileName>{evidence.filename}</FileName>
                      <FileMeta>
                        Uploaded {new Date(evidence.uploadedAt).toLocaleString()} · {evidence.description}
                      </FileMeta>
                    </FileDetails>
                  </UploadedFileInfo>
                ))}
              </RequirementsList>
            </div>
          )}

          {merFiles.length === 0 && uploadedCount === 0 && (
            <div style={{ textAlign: 'center', color: colors.text.tertiary, fontSize: '0.875rem', padding: `${spacing.lg} 0` }}>
              No files uploaded yet — this step is optional for MER submissions.
            </div>
          )}
        </>
      )}

      {/* Non-MER: requirements checklist */}
      {!isMER && requirements.length > 0 && (
        <div>
          <SectionTitle>Required evidence ({requirements.length} items)</SectionTitle>
          <RequirementsList>
            {requirements.map((req, index) => {
              const uploadedEv = Array.from(uploadedEvidence.entries()).find(([k]) => k.startsWith(req.id.split('-').slice(0, 3).join('-')));
              const isUploaded = !!uploadedEv;
              const state = getState(req.id);
              const isExpanded = expandedItems.has(req.id);
              const idxStr = `${req.id}::${index}`;

              return (
                <RequirementCard key={req.id} $status={isUploaded ? 'uploaded' : state.error ? 'error' : 'pending'}>
                  <RequirementHeader
                    $isExpanded={isExpanded}
                    onClick={() => !isUploaded && toggleExpand(req.id)}
                    aria-expanded={isExpanded}
                    aria-label={`${req.label}${isUploaded ? ', uploaded' : ', pending upload'}`}
                  >
                    <RequirementStatusIcon $status={isUploaded ? 'uploaded' : state.error ? 'error' : 'pending'}>
                      {isUploaded ? <FiCheck size={12} /> : state.error ? <FiAlertCircle size={12} /> : <FiUpload size={12} />}
                    </RequirementStatusIcon>
                    <RequirementInfo>
                      <RequirementLabel>{req.label}</RequirementLabel>
                      <RequirementMeta>
                        {req.entity && `${req.entity} · `}{isUploaded ? 'Uploaded' : 'Upload required'}
                      </RequirementMeta>
                    </RequirementInfo>
                    {!isUploaded && (
                      <ChevronIcon $isExpanded={isExpanded}>
                        <FiChevronDown size={16} />
                      </ChevronIcon>
                    )}
                    {isUploaded && (
                      <span style={{ fontSize: '0.75rem', color: colors.semantic.success, fontWeight: 600 }}>✓ Done</span>
                    )}
                  </RequirementHeader>

                  {isUploaded && uploadedEv && (
                    <RequirementBody>
                      <UploadedFileInfo>
                        <FileIconBox $success>
                          <FiCheck size={14} />
                        </FileIconBox>
                        <FileDetails>
                          <FileName>{uploadedEv[1].filename}</FileName>
                          <FileMeta>Uploaded {new Date(uploadedEv[1].uploadedAt).toLocaleDateString()}</FileMeta>
                        </FileDetails>
                      </UploadedFileInfo>
                    </RequirementBody>
                  )}

                  {!isUploaded && isExpanded && (
                    <RequirementBody>
                      <ActionDescription>{req.description}</ActionDescription>

                      <UploadArea
                        $isDragOver={state.isDragOver}
                        $hasFile={!!state.file}
                        onClick={() => itemInputRefs.current[req.id]?.click()}
                        onDrop={e => handleItemFileDrop(req.id, e)}
                        onDragOver={e => { e.preventDefault(); patchState(req.id, { isDragOver: true }); }}
                        onDragLeave={e => { e.preventDefault(); patchState(req.id, { isDragOver: false }); }}
                      >
                        <input
                          ref={el => { if (el) itemInputRefs.current[req.id] = el; }}
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          style={{ display: 'none' }}
                          onChange={e => handleItemFileInput(req.id, e)}
                        />
                        {state.file ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' }}>
                              <FiFile size={16} style={{ color: colors.semantic.success }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: colors.text.primary }}>{state.file.name}</span>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text.tertiary, display: 'flex' }}
                                onClick={e => { e.stopPropagation(); patchState(req.id, { file: null }); }}
                                aria-label="Remove file"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: colors.text.tertiary, marginTop: '4px' }}>{formatSize(state.file.size)}</div>
                          </div>
                        ) : (
                          <div style={{ color: colors.text.tertiary, fontSize: '0.85rem' }}>
                            <FiUpload style={{ marginBottom: '6px' }} />
                            <div>Click to select or drag file here</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>PDF, DOC, XLS · max 10 MB</div>
                          </div>
                        )}
                      </UploadArea>

                      <DescriptionInput
                        placeholder="Describe this evidence briefly…"
                        value={state.description}
                        onChange={e => patchState(req.id, { description: e.target.value })}
                      />

                      <UploadButton
                        $disabled={!state.file || !state.description.trim() || state.isUploading}
                        disabled={!state.file || !state.description.trim() || state.isUploading}
                        onClick={() => uploadRequirementFile(req, idxStr)}
                        style={{ display: 'block' }}
                      >
                        {state.isUploading ? <><SpinnerInline>↻</SpinnerInline> Uploading…</> : 'Upload Evidence'}
                      </UploadButton>

                      {state.error && (
                        <ErrorText role="alert">
                          <FiAlertCircle size={12} />
                          {state.error}
                        </ErrorText>
                      )}
                    </RequirementBody>
                  )}
                </RequirementCard>
              );
            })}
          </RequirementsList>
        </div>
      )}

      {!isMER && requirements.length === 0 && !questionnaireData && (
        <div style={{ textAlign: 'center', color: colors.text.tertiary, fontSize: '0.875rem', padding: `${spacing.lg} 0` }}>
          Complete the questionnaire first to see the required evidence items.
        </div>
      )}
    </Container>
  );
};

export default FileManager;
