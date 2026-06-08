import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiUpload, FiLayers, FiFileText, FiSearch, FiList, FiClipboard } from 'react-icons/fi';
import { colors, spacing, borderRadius, shadows } from '../../styles/designTokens';
import { ControlMetadata } from '../../services/controlService';
import { ApplicationData } from '../../services/applicationDataService';
import { MERTemplate, MERType, UploadedTemplate, Evidence } from '../../types/index';
import { FormData } from '../../App';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const Banner = styled.div`
  padding: ${spacing.lg};
  background: ${colors.status.underReview}08;
  border: 1px solid ${colors.status.underReview}25;
  border-radius: ${borderRadius.base};
  font-size: 0.9rem;
  color: ${colors.status.underReview};
  font-weight: 500;
  line-height: 1.5;
`;

const ReviewSection = styled.div`
  background: white;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  box-shadow: ${shadows.sm};
`;

const ReviewSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.neutral.gray50};
  border-bottom: 1px solid ${colors.neutral.gray100};
`;

const ReviewSectionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.base};
  background: ${colors.status.underReview}15;
  color: ${colors.status.underReview};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ReviewSectionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text.primary};
`;

const ReviewSectionStatus = styled.div<{ $ok: boolean }>`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: 0.78rem;
  font-weight: 600;
  color: ${props => props.$ok ? colors.semantic.success : colors.semantic.warning};
`;

const ReviewSectionBody = styled.div`
  padding: ${spacing.lg};
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${spacing.md};
`;

const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DataLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DataValue = styled.span`
  font-size: 0.875rem;
  color: ${colors.text.primary};
  font-weight: 500;
  line-height: 1.4;
`;

const TypeBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${borderRadius.full};
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  ${props => {
    switch (props.$type) {
      case 'MER': return `background: ${colors.status.underReview}15; color: ${colors.status.underReview};`;
      case 'EUC': return `background: ${colors.status.approved}15; color: ${colors.status.approved};`;
      default: return `background: ${colors.neutral.gray200}; color: ${colors.text.secondary};`;
    }
  }}
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: ${borderRadius.full};
  background: ${colors.neutral.gray100};
  color: ${colors.text.secondary};
  font-size: 0.78rem;
  font-weight: 500;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.semantic.success}06;
  border: 1px solid ${colors.semantic.success}25;
  border-radius: ${borderRadius.sm};
`;

const SubmitNote = styled.div`
  padding: ${spacing.lg};
  background: ${colors.neutral.gray50};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  font-size: 0.85rem;
  color: ${colors.text.secondary};
  line-height: 1.6;
`;

interface ReviewStepProps {
  isMER: boolean;
  selectedControl: ControlMetadata | null;
  /** When multiple MER controls were selected */
  selectedControls?: ControlMetadata[];
  selectedMERType: MERType | null;
  applicationData: ApplicationData | null;
  merTemplate: MERTemplate | null;
  uploadedTemplate: UploadedTemplate | null;
  questionnaireData: Partial<FormData> | null;
  uploadedEvidence: Map<string, Evidence>;
  currentTransferId: string | null;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  isMER,
  selectedControl,
  selectedControls,
  selectedMERType,
  applicationData,
  merTemplate,
  uploadedTemplate,
  questionnaireData,
  uploadedEvidence,
  currentTransferId,
}) => {
  const templateDone = !!(merTemplate || uploadedTemplate);

  return (
    <Container>
      <Banner>
        Please review your submission before sending. Once submitted, your request will be routed to the compliance team for review.
      </Banner>

      {/* Control */}
      <ReviewSection aria-labelledby="review-control">
        <ReviewSectionHeader>
          <ReviewSectionIcon><FiLayers size={16} /></ReviewSectionIcon>
          <ReviewSectionTitle id="review-control">Selected Control</ReviewSectionTitle>
          <ReviewSectionStatus $ok={!!selectedControl}>
            {selectedControl ? <><FiCheck size={12} /> Complete</> : '⚠ Missing'}
          </ReviewSectionStatus>
        </ReviewSectionHeader>
        <ReviewSectionBody>
          {selectedControl ? (
            <>
              {selectedControls && selectedControls.length > 1 && (
                <TagList style={{ marginBottom: spacing.md }}>
                  {selectedControls.map(c => (
                    <Tag key={c.controlId}>
                      {c.controlId} · {c.applicationName}
                    </Tag>
                  ))}
                </TagList>
              )}
              <DataGrid>
                <DataItem>
                  <DataLabel>Control ID</DataLabel>
                  <DataValue>{selectedControl.controlId}</DataValue>
                </DataItem>
                <DataItem>
                  <DataLabel>Type</DataLabel>
                  <DataValue>
                    <TypeBadge $type={selectedControl.controlType}>{selectedControl.controlType}</TypeBadge>
                  </DataValue>
                </DataItem>
                <DataItem>
                  <DataLabel>Application</DataLabel>
                  <DataValue>{selectedControl.applicationName}</DataValue>
                </DataItem>
                <DataItem>
                  <DataLabel>Manager</DataLabel>
                  <DataValue>{selectedControl.applicationManager}</DataValue>
                </DataItem>
              </DataGrid>
            </>
          ) : (
            <span style={{ color: colors.text.tertiary, fontSize: '0.875rem' }}>No control selected.</span>
          )}
        </ReviewSectionBody>
      </ReviewSection>

      {/* MER specific sections */}
      {isMER && (
        <>
          <ReviewSection aria-labelledby="review-mer-type">
            <ReviewSectionHeader>
              <ReviewSectionIcon><FiList size={16} /></ReviewSectionIcon>
              <ReviewSectionTitle id="review-mer-type">MER Type</ReviewSectionTitle>
              <ReviewSectionStatus $ok={!!selectedMERType}>
                {selectedMERType ? <><FiCheck size={12} /> Complete</> : '⚠ Missing'}
              </ReviewSectionStatus>
            </ReviewSectionHeader>
            <ReviewSectionBody>
              {selectedMERType
                ? <DataValue>{selectedMERType}</DataValue>
                : <span style={{ color: colors.text.tertiary, fontSize: '0.875rem' }}>Not selected.</span>}
            </ReviewSectionBody>
          </ReviewSection>

          <ReviewSection aria-labelledby="review-app-id">
            <ReviewSectionHeader>
              <ReviewSectionIcon><FiSearch size={16} /></ReviewSectionIcon>
              <ReviewSectionTitle id="review-app-id">Application Data</ReviewSectionTitle>
              <ReviewSectionStatus $ok={!!applicationData}>
                {applicationData ? <><FiCheck size={12} /> Complete</> : '⚠ Missing'}
              </ReviewSectionStatus>
            </ReviewSectionHeader>
            <ReviewSectionBody>
              {applicationData ? (
                <DataGrid>
                  <DataItem>
                    <DataLabel>Owner</DataLabel>
                    <DataValue>{applicationData.owner}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Classification</DataLabel>
                    <DataValue>{applicationData.dataClassification}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Locations</DataLabel>
                    <DataValue>{applicationData.locations.join(', ')}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Hosting</DataLabel>
                    <DataValue>{applicationData.hostingProvider}</DataValue>
                  </DataItem>
                </DataGrid>
              ) : (
                <span style={{ color: colors.text.tertiary, fontSize: '0.875rem' }}>No application data.</span>
              )}
            </ReviewSectionBody>
          </ReviewSection>

          <ReviewSection aria-labelledby="review-template">
            <ReviewSectionHeader>
              <ReviewSectionIcon><FiFileText size={16} /></ReviewSectionIcon>
              <ReviewSectionTitle id="review-template">MER Template</ReviewSectionTitle>
              <ReviewSectionStatus $ok={templateDone}>
                {templateDone ? <><FiCheck size={12} /> Complete</> : '⚠ Incomplete'}
              </ReviewSectionStatus>
            </ReviewSectionHeader>
            <ReviewSectionBody>
              {uploadedTemplate ? (
                <DataGrid>
                  <DataItem>
                    <DataLabel>Template</DataLabel>
                    <DataValue>{uploadedTemplate.name}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Type</DataLabel>
                    <DataValue>{uploadedTemplate.templateType}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Transfer ID</DataLabel>
                    <DataValue style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{currentTransferId || '—'}</DataValue>
                  </DataItem>
                </DataGrid>
              ) : merTemplate ? (
                <DataGrid>
                  <DataItem>
                    <DataLabel>MER Type</DataLabel>
                    <DataValue>{merTemplate.merType}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Version</DataLabel>
                    <DataValue>{merTemplate.version}</DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Transfer ID</DataLabel>
                    <DataValue style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{currentTransferId || '—'}</DataValue>
                  </DataItem>
                </DataGrid>
              ) : (
                <span style={{ color: colors.text.tertiary, fontSize: '0.875rem' }}>Template not yet completed.</span>
              )}
            </ReviewSectionBody>
          </ReviewSection>
        </>
      )}

      {/* Non-MER specific sections */}
      {!isMER && (
        <>
          <ReviewSection aria-labelledby="review-questionnaire">
            <ReviewSectionHeader>
              <ReviewSectionIcon><FiClipboard size={16} /></ReviewSectionIcon>
              <ReviewSectionTitle id="review-questionnaire">Questionnaire</ReviewSectionTitle>
              <ReviewSectionStatus $ok={!!questionnaireData}>
                {questionnaireData ? <><FiCheck size={12} /> Complete</> : '⚠ Incomplete'}
              </ReviewSectionStatus>
            </ReviewSectionHeader>
            <ReviewSectionBody>
              {questionnaireData ? (
                <DataGrid>
                  <DataItem>
                    <DataLabel>Countries</DataLabel>
                    <DataValue>
                      <TagList>
                        {(questionnaireData.countries || []).map(c => <Tag key={c}>{c}</Tag>)}
                      </TagList>
                    </DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Data Subject Types</DataLabel>
                    <DataValue>
                      <TagList>
                        {(Array.isArray(questionnaireData.dataSubjectType)
                          ? questionnaireData.dataSubjectType
                          : (Object.values(questionnaireData.dataSubjectType || {}) as string[][]).flat()
                        ).map(t => (
                          <Tag key={String(t)}>{String(t)}</Tag>
                        ))}
                      </TagList>
                    </DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Recipient Types</DataLabel>
                    <DataValue>
                      <TagList>
                        {(questionnaireData.recipientType || []).map(r => <Tag key={r}>{r}</Tag>)}
                      </TagList>
                    </DataValue>
                  </DataItem>
                  <DataItem>
                    <DataLabel>Transfer ID</DataLabel>
                    <DataValue style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{currentTransferId || '—'}</DataValue>
                  </DataItem>
                </DataGrid>
              ) : (
                <span style={{ color: colors.text.tertiary, fontSize: '0.875rem' }}>Questionnaire not completed.</span>
              )}
            </ReviewSectionBody>
          </ReviewSection>
        </>
      )}

      {/* Evidence */}
      <ReviewSection aria-labelledby="review-evidence">
        <ReviewSectionHeader>
          <ReviewSectionIcon><FiUpload size={16} /></ReviewSectionIcon>
          <ReviewSectionTitle id="review-evidence">
            Evidence {isMER ? '(Optional)' : ''}
          </ReviewSectionTitle>
          <ReviewSectionStatus $ok={isMER || uploadedEvidence.size > 0}>
            {uploadedEvidence.size > 0
              ? <><FiCheck size={12} /> {uploadedEvidence.size} file{uploadedEvidence.size !== 1 ? 's' : ''} uploaded</>
              : isMER ? 'Skipped (optional)' : '⚠ No files uploaded'}
          </ReviewSectionStatus>
        </ReviewSectionHeader>
        <ReviewSectionBody>
          {uploadedEvidence.size > 0 ? (
            <FileList>
              {Array.from(uploadedEvidence.values()).map(ev => (
                <FileRow key={ev.id}>
                  <FiCheck size={14} style={{ color: colors.semantic.success, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: colors.text.primary }}>{ev.filename}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.text.tertiary }}>
                      {ev.description} · Uploaded {new Date(ev.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </FileRow>
              ))}
            </FileList>
          ) : (
            <span style={{ color: colors.text.tertiary, fontSize: '0.875rem' }}>
              {isMER ? 'No supporting documents uploaded — submission can proceed.' : 'No evidence files uploaded yet.'}
            </span>
          )}
        </ReviewSectionBody>
      </ReviewSection>

      <SubmitNote>
        By submitting, you confirm that all information provided is accurate and complete. The compliance team will be notified and will review your submission. You will receive a notification once a decision has been made.
      </SubmitNote>
    </Container>
  );
};

export default ReviewStep;
