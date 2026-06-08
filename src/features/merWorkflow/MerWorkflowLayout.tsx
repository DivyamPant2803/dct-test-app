import React, { useMemo, useCallback, useState, Suspense, lazy, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiLayers,
  FiFileText,
  FiClipboard,
  FiUpload,
  FiSearch,
  FiList,
  FiEdit2,
  FiCheckSquare,
  FiArrowLeft,
} from 'react-icons/fi';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import { WorkflowStep } from '../../components/common/WorkflowStepper';
import ControlSelector from '../../components/CentralInventory/ControlSelector';
import TransferDetails from '../../components/CentralInventory/TransferDetails';
import InventoryQuestionnaire from '../../components/CentralInventory/InventoryQuestionnaire';
import FileManager from '../../components/CentralInventory/FileManager';
import MERTypeSelector from '../../components/CentralInventory/MERTypeSelector';
import ApplicationIdentificationStep from '../../components/CentralInventory/ApplicationIdentificationStep';
import StepSidebar, { SubNavItem } from '../../components/CentralInventory/StepSidebar';
import StepActions from '../../components/CentralInventory/StepActions';
import ReviewStep from '../../components/CentralInventory/ReviewStep';
import MerSectionStepper from '../../components/CentralInventory/MerSectionStepper';
import MerWorkflowSetupBreadcrumbs from '../../components/CentralInventory/MerWorkflowSetupBreadcrumbs';
import { MerSectionStatus } from '../../utils/merTemplateSectionStatus';
import { useMerWorkflowState } from './useMerWorkflowState';
import { getAllowedMerTypesForControls, readRecentControlIds } from './merCatalogService';
import { getControlById } from '../../services/controlService';

const MERTemplateReview = lazy(() => import('../../components/CentralInventory/MERTemplateReview'));
const PDFTemplateViewer = lazy(() => import('../../components/CentralInventory/PDFTemplateViewer'));
const DynamicTemplateForm = lazy(() => import('../../components/CentralInventory/DynamicTemplateForm'));

const PageShell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background: ${colors.background.default};
  overflow: hidden;
`;

const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

const MainScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  margin-bottom: ${spacing.sm};
  flex-wrap: wrap;
`;

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.neutral.gray300};
  border-radius: ${borderRadius.base};
  background: white;
  color: ${colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: ${colors.neutral.gray50};
  }
  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${colors.text.primary};
  margin: 0;
`;

const WorkflowBadge = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: ${borderRadius.full};
  background: ${colors.neutral.gray100};
  color: ${colors.text.tertiary};
`;

const CompletedSummariesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  background: white;
  border: 1px solid ${colors.neutral.gray200};
  border-left: 3px solid ${colors.status.approved};
  border-radius: ${borderRadius.base};
  box-shadow: ${shadows.sm};
`;

const SummaryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.base};
  background: ${colors.status.approved}15;
  color: ${colors.status.approved};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SummaryContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SummaryLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.text.tertiary};
  margin-bottom: 2px;
`;

const SummaryValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.md};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.base};
  background: white;
  color: ${colors.text.secondary};
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  white-space: nowrap;
  &:hover {
    border-color: ${colors.neutral.gray400};
    color: ${colors.text.primary};
    background: ${colors.background.hover};
  }
  &:focus-visible {
    outline: 2px solid ${colors.status.underReview};
    outline-offset: 2px;
  }
`;

const ActiveStepCard = styled.section`
  background: white;
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.base};
`;

const ActiveStepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.xl};
  padding-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral.gray100};
`;

const ActiveStepIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.base};
  background: ${colors.status.underReview}12;
  color: ${colors.status.underReview};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const ActiveStepTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;

const LazyFallback = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.text.tertiary};
  font-size: 0.875rem;
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.lg} ${spacing.xl};
  background: ${colors.semantic.success}12;
  border: 1px solid ${colors.semantic.success}40;
  border-radius: ${borderRadius.lg};
  color: ${colors.semantic.success};
  font-weight: 500;
`;

const TemplateRow = styled.div`
  display: flex;
  gap: ${spacing.xl};
  align-items: flex-start;
  width: 100%;
`;

const StepperRail = styled.aside`
  flex: 0 0 min(280px, 34%);
  max-width: 300px;
  position: sticky;
  top: ${spacing.md};
  align-self: flex-start;
  z-index: 2;
`;

const TemplateMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const PostTemplateNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const PostStep = styled.span<{ $active: boolean; $done: boolean }>`
  font-size: 0.78rem;
  font-weight: 600;
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  color: ${p => (p.$active ? colors.text.primary : p.$done ? colors.semantic.success : colors.text.tertiary)};
  background: ${p => (p.$active ? colors.neutral.gray100 : 'transparent')};
  border: 1px solid ${p => (p.$active ? colors.neutral.gray300 : 'transparent')};
`;

const ValidationBanner = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.semantic.warning}10;
  border: 1px solid ${colors.semantic.warning}35;
  border-radius: ${borderRadius.base};
  font-size: 0.85rem;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md};
`;

export type MerWorkflowLayoutVariant = 'central-inventory' | 'my-transfers';

export interface MerWorkflowLayoutProps {
  variant: MerWorkflowLayoutVariant;
  pageTitle: string;
  onNavigateBack?: () => void;
  onAfterSubmitSuccess?: () => void;
}

const MerWorkflowLayout: React.FC<MerWorkflowLayoutProps> = ({
  variant,
  pageTitle,
  onNavigateBack,
  onAfterSubmitSuccess,
}) => {
  const engine = useMerWorkflowState({ onAfterSubmitSuccess });
  const {
    dispatch,
    selectedControl,
    selectedControls,
    isMERControl,
    selectedMERType,
    applicationData,
    merTemplate,
    uploadedTemplate,
    questionnaireData,
    uploadedEvidence,
    currentTransferId,
    currentStep,
    isSubmitted,
    isSubmitting,
    setSelectedControls,
    handleControlContinue,
    handleMERTypeSelect,
    handleApplicationDataFetched,
    handleApplicationDataContinue,
    handlePDFTemplateComplete,
    handleMERTemplateComplete,
    handleQuestionnaireComplete,
    handleEvidenceUploaded,
    handleSubmit,
  } = engine;

  const [sectionStatuses, setSectionStatuses] = useState<Record<string, MerSectionStatus>>({});
  const [activeTemplateSectionId, setActiveTemplateSectionId] = useState<string | null>(null);

  const allowedMerTypes = useMemo(
    () => getAllowedMerTypesForControls(selectedControls),
    [selectedControls]
  );

  useEffect(() => {
    if (!selectedMERType || allowedMerTypes.length === 0) return;
    if (!allowedMerTypes.includes(selectedMERType)) {
      dispatch({ type: 'NAVIGATE_BACK_TO', step: 1 });
    }
  }, [selectedMERType, allowedMerTypes, dispatch]);

  const recentControls = useMemo(() => {
    const ids = readRecentControlIds();
    return ids.map(id => getControlById(id)).filter((c): c is NonNullable<typeof c> => !!c);
  }, []);

  /**
   * `isMERControl` is false until at least one MER control is selected, which wrongly
   * enabled the non-MER StepSidebar on `/my-transfers/new`. That route is MER-only, so
   * treat it as MER flow for chrome (breadcrumbs / no workflow sidebar) from step 0.
   */
  const useMerStepFlow = variant === 'my-transfers' || isMERControl;
  const merUseBreadcrumbs = useMerStepFlow;
  const showWorkflowSidebar = !useMerStepFlow;

  const workflowSteps: WorkflowStep[] = useMemo(() => {
    const templateComplete = !!(merTemplate || uploadedTemplate) && !!currentTransferId;
    const steps: WorkflowStep[] = [
      {
        id: 'control',
        label: 'Select Control',
        icon: <FiLayers />,
        completed: !!selectedControl && currentStep > 0,
        current: currentStep === 0,
        onClick: () => dispatch({ type: 'NAVIGATE_BACK_TO', step: 0 }),
      },
    ];
    if (isMERControl) {
      steps.push(
        {
          id: 'mer-type',
          label: 'MER Type',
          icon: <FiList />,
          completed: !!selectedMERType && currentStep > 1,
          current: currentStep === 1,
          onClick: () => selectedControl && dispatch({ type: 'NAVIGATE_BACK_TO', step: 1 }),
        },
        {
          id: 'app-id',
          label: 'Application ID',
          icon: <FiSearch />,
          completed: !!applicationData && currentStep > 2,
          current: currentStep === 2,
          onClick: () => selectedMERType && dispatch({ type: 'NAVIGATE_BACK_TO', step: 2 }),
        },
        {
          id: 'mer-template',
          label: 'MER Template',
          icon: <FiFileText />,
          completed: templateComplete && currentStep > 3,
          current: currentStep === 3,
          onClick: () => applicationData && dispatch({ type: 'NAVIGATE_BACK_TO', step: 3 }),
        },
        {
          id: 'evidence',
          label: 'Evidence (Optional)',
          icon: <FiUpload />,
          completed: currentStep > 4,
          current: currentStep === 4,
          onClick: () => templateComplete && dispatch({ type: 'SET_STEP', step: 4 }),
        },
        {
          id: 'review',
          label: 'Review & Submit',
          icon: <FiCheckSquare />,
          completed: isSubmitted,
          current: currentStep === 5,
          onClick: () => currentStep > 4 && dispatch({ type: 'SET_STEP', step: 5 }),
        }
      );
    } else {
      steps.push(
        {
          id: 'details',
          label: 'Transfer Details',
          icon: <FiFileText />,
          completed: !!selectedControl && currentStep > 2,
          current: currentStep === 2,
          onClick: () => selectedControl && dispatch({ type: 'NAVIGATE_BACK_TO', step: 2 }),
        },
        {
          id: 'questionnaire',
          label: 'Questionnaire',
          icon: <FiClipboard />,
          completed: !!questionnaireData && currentStep > 3,
          current: currentStep === 3,
          onClick: () => selectedControl && dispatch({ type: 'SET_STEP', step: 3 }),
        },
        {
          id: 'evidence',
          label: 'Evidence Upload',
          icon: <FiUpload />,
          completed: uploadedEvidence.size > 0 && currentStep > 4,
          current: currentStep === 4,
          onClick: () => questionnaireData && dispatch({ type: 'SET_STEP', step: 4 }),
        },
        {
          id: 'review',
          label: 'Review & Submit',
          icon: <FiCheckSquare />,
          completed: isSubmitted,
          current: currentStep === 5,
          onClick: () => currentStep > 4 && dispatch({ type: 'SET_STEP', step: 5 }),
        }
      );
    }
    return steps;
  }, [
    selectedControl,
    isMERControl,
    selectedMERType,
    applicationData,
    merTemplate,
    uploadedTemplate,
    questionnaireData,
    uploadedEvidence.size,
    currentStep,
    currentTransferId,
    isSubmitted,
    dispatch,
  ]);

  const handleSidebarStepClick = useCallback(
    (stepIndex: number) => {
      const step = workflowSteps[stepIndex];
      step.onClick?.();
    },
    [workflowSteps]
  );

  const subNavItems: SubNavItem[] = useMemo(() => {
    if (!showWorkflowSidebar || currentStep !== 3 || !isMERControl || !uploadedTemplate?.sections) return [];
    return [...uploadedTemplate.sections]
      .sort((a, b) => a.order - b.order)
      .map(section => {
        const prefilledCount = section.fields.filter(f => f.prefillSource).length;
        return {
          id: section.id,
          label: section.title,
          badge: prefilledCount > 0 ? `${prefilledCount} prefilled` : undefined,
        };
      });
  }, [showWorkflowSidebar, currentStep, isMERControl, uploadedTemplate]);

  const handleSubNavClick = useCallback((sectionId: string) => {
    const el = document.getElementById(`template-section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  type SummaryEntry = {
    id: string;
    icon: React.ReactNode;
    label: string;
    value: string;
    editStep: number;
    show: boolean;
  };

  const controlSummaryValue =
    selectedControls.length === 0
      ? ''
      : selectedControls.length === 1
        ? `${selectedControls[0].controlType} · ${selectedControls[0].controlId} — ${selectedControls[0].applicationName}`
        : `${selectedControls.length} controls: ${selectedControls.map(c => c.controlId).join(', ')}`;

  const completedSummaries: SummaryEntry[] = useMemo(() => {
    const entries: SummaryEntry[] = [
      {
        id: 'control-summary',
        icon: <FiLayers size={16} />,
        label: 'Control',
        value: controlSummaryValue,
        editStep: 0,
        show: selectedControls.length > 0 && currentStep > 0,
      },
    ];
    if (isMERControl) {
      entries.push(
        {
          id: 'mer-type-summary',
          icon: <FiList size={16} />,
          label: 'MER Type',
          value: selectedMERType || '',
          editStep: 1,
          show: !!selectedMERType && currentStep > 1,
        },
        {
          id: 'app-id-summary',
          icon: <FiSearch size={16} />,
          label: 'Application Data',
          value: applicationData ? `${applicationData.owner} · ${applicationData.locations.join(', ')}` : '',
          editStep: 2,
          show: !!applicationData && currentStep > 2,
        },
        {
          id: 'template-summary',
          icon: <FiFileText size={16} />,
          label: 'MER Template',
          value: uploadedTemplate
            ? `${uploadedTemplate.name} — Completed`
            : merTemplate
              ? `${merTemplate.merType} v${merTemplate.version} — Completed`
              : '',
          editStep: 3,
          show: !!(merTemplate || uploadedTemplate) && currentStep > 3,
        }
      );
    } else {
      entries.push(
        {
          id: 'details-summary',
          icon: <FiFileText size={16} />,
          label: 'Transfer Details',
          value: selectedControl ? `${selectedControl.controlId} — ${selectedControl.applicationName}` : '',
          editStep: 2,
          show: !!selectedControl && currentStep > 2,
        },
        {
          id: 'questionnaire-summary',
          icon: <FiClipboard size={16} />,
          label: 'Questionnaire',
          value: questionnaireData
            ? `Countries: ${(questionnaireData.countries || []).join(', ') || 'none'}`
            : '',
          editStep: 3,
          show: !!questionnaireData && currentStep > 3,
        }
      );
    }
    entries.push({
      id: 'evidence-summary',
      icon: <FiUpload size={16} />,
      label: 'Evidence',
      value:
        uploadedEvidence.size > 0
          ? `${uploadedEvidence.size} file${uploadedEvidence.size !== 1 ? 's' : ''} uploaded`
          : isMERControl
            ? 'Skipped (optional)'
            : 'No files uploaded',
      editStep: 4,
      show: currentStep > 4,
    });
    return entries.filter(e => e.show);
  }, [
    controlSummaryValue,
    selectedControls.length,
    isMERControl,
    selectedMERType,
    applicationData,
    merTemplate,
    uploadedTemplate,
    questionnaireData,
    uploadedEvidence.size,
    currentStep,
    selectedControl,
  ]);

  const stepsActionsConfig = useMemo(() => {
    const cfg = {
      showBack: true,
      onBack: undefined as (() => void) | undefined,
      showContinue: true,
      canContinue: false,
      disabledReason: undefined as string | undefined,
      continueLabel: 'Continue',
      isSubmit: false,
      isLoading: false,
    };
    switch (currentStep) {
      case 0:
        cfg.showBack = variant === 'my-transfers' && !!onNavigateBack;
        cfg.onBack = onNavigateBack;
        cfg.canContinue =
          selectedControls.length > 0 &&
          (!isMERControl || allowedMerTypes.length > 0);
        cfg.disabledReason =
          selectedControls.length === 0
            ? 'Select at least one control to continue'
            : isMERControl && allowedMerTypes.length === 0
              ? 'No MER type is compatible with all selected controls'
              : undefined;
        break;
      case 1:
        cfg.onBack = () => dispatch({ type: 'SET_STEP', step: 0 });
        cfg.showContinue = false;
        break;
      case 2:
        if (isMERControl) {
          cfg.onBack = () => dispatch({ type: 'NAVIGATE_BACK_TO', step: 1 });
          cfg.canContinue = !!applicationData;
          cfg.disabledReason = applicationData ? undefined : 'Fetch your application data first';
        } else {
          cfg.onBack = () => dispatch({ type: 'NAVIGATE_BACK_TO', step: 0 });
          cfg.canContinue = true;
        }
        break;
      case 3:
        if (isMERControl) {
          cfg.onBack = () => dispatch({ type: 'NAVIGATE_BACK_TO', step: 2 });
          cfg.canContinue = !!currentTransferId;
          cfg.disabledReason = currentTransferId ? undefined : 'Complete and save the template above to proceed';
        } else {
          cfg.onBack = () => dispatch({ type: 'SET_STEP', step: 2 });
          cfg.canContinue = !!questionnaireData;
          cfg.disabledReason = questionnaireData ? undefined : 'Complete the questionnaire above to proceed';
        }
        break;
      case 4:
        cfg.onBack = () => dispatch({ type: 'SET_STEP', step: 3 });
        cfg.canContinue = true;
        cfg.continueLabel = 'Review & Submit';
        break;
      case 5:
        cfg.onBack = () => dispatch({ type: 'SET_STEP', step: 4 });
        cfg.isSubmit = true;
        cfg.continueLabel = isSubmitting ? 'Submitting…' : 'Submit Request';
        cfg.isLoading = isSubmitting;
        cfg.canContinue =
          !isSubmitted &&
          !isSubmitting &&
          !!selectedControl &&
          !!currentTransferId &&
          (isMERControl ? !!(merTemplate || uploadedTemplate) : !!questionnaireData);
        cfg.disabledReason = isSubmitted ? 'Already submitted' : undefined;
        break;
    }
    return cfg;
  }, [
    currentStep,
    selectedControls.length,
    selectedControl,
    isMERControl,
    applicationData,
    questionnaireData,
    currentTransferId,
    merTemplate,
    uploadedTemplate,
    isSubmitted,
    isSubmitting,
    dispatch,
    variant,
    onNavigateBack,
    allowedMerTypes,
  ]);

  const handleStepActionsContinue = useCallback(() => {
    switch (currentStep) {
      case 0:
        handleControlContinue();
        break;
      case 2:
        if (isMERControl) handleApplicationDataContinue();
        else dispatch({ type: 'SET_STEP', step: 3 });
        break;
      case 4:
        dispatch({ type: 'SET_STEP', step: 5 });
        break;
      case 5:
        handleSubmit();
        break;
    }
  }, [currentStep, isMERControl, handleControlContinue, handleApplicationDataContinue, handleSubmit, dispatch]);

  const getStepInfo = (): { icon: React.ReactNode; title: string } => {
    switch (currentStep) {
      case 0:
        return { icon: <FiLayers />, title: 'Select Controls' };
      case 1:
        return { icon: <FiList />, title: 'Select MER Type' };
      case 2:
        return isMERControl
          ? { icon: <FiSearch />, title: 'Application Identification' }
          : { icon: <FiFileText />, title: 'Transfer Details' };
      case 3:
        return isMERControl
          ? {
              icon: <FiFileText />,
              title: `MER Template${uploadedTemplate ? ` — ${uploadedTemplate.name}` : selectedMERType ? ` — ${selectedMERType}` : ''}`,
            }
          : { icon: <FiClipboard />, title: 'Questionnaire' };
      case 4:
        return { icon: <FiUpload />, title: `Evidence Uploads${isMERControl ? ' (Optional)' : ''}` };
      case 5:
        return { icon: <FiCheckSquare />, title: 'Review & Submit' };
      default:
        return { icon: <FiLayers />, title: '' };
    }
  };

  const stepInfo = getStepInfo();

  const sectionOrder = useMemo(() => {
    if (!uploadedTemplate?.sections) return [];
    return [...uploadedTemplate.sections].sort((a, b) => a.order - b.order).map(s => ({ id: s.id, title: s.title }));
  }, [uploadedTemplate]);

  useEffect(() => {
    if (sectionOrder.length === 0) return;
    setActiveTemplateSectionId(prev => {
      if (prev && sectionOrder.some(s => s.id === prev)) return prev;
      return sectionOrder[0].id;
    });
  }, [sectionOrder]);

  const incompleteSections = useMemo(() => {
    return sectionOrder.filter(s => sectionStatuses[s.id] && sectionStatuses[s.id] !== 'complete');
  }, [sectionOrder, sectionStatuses]);

  const showSectionRail =
    merUseBreadcrumbs &&
    currentStep === 3 &&
    isMERControl &&
    uploadedTemplate?.templateType === 'DYNAMIC_FORM' &&
    !!uploadedTemplate.sections?.length;

  const handleSectionSelect = useCallback((sectionId: string) => {
    setActiveTemplateSectionId(sectionId);
    const el = document.getElementById(`template-section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (!showSectionRail || sectionOrder.length === 0) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    let raf = 0;

    const attach = () => {
      if (cancelled) return;
      const elements = sectionOrder
        .map(s => document.getElementById(`template-section-${s.id}`))
        .filter((el): el is HTMLElement => !!el);
      if (!elements.length) return;

      observer = new IntersectionObserver(
        entries => {
          const visible = entries
            .filter(e => e.isIntersecting && e.intersectionRatio > 0)
            .sort((a, b) => {
              if (Math.abs(b.intersectionRatio - a.intersectionRatio) > 0.01) {
                return b.intersectionRatio - a.intersectionRatio;
              }
              return a.boundingClientRect.top - b.boundingClientRect.top;
            });
          const best = visible[0];
          if (!best?.target.id.startsWith('template-section-')) return;
          const id = best.target.id.slice('template-section-'.length);
          setActiveTemplateSectionId(id);
        },
        {
          root: null,
          rootMargin: '-8% 0px -42% 0px',
          threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
        }
      );
      elements.forEach(el => observer!.observe(el));
    };

    raf = window.requestAnimationFrame(() => window.requestAnimationFrame(attach));

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [showSectionRail, sectionOrder, uploadedTemplate?.id]);

  const renderActiveStepContent = () => {
    const controlMode = variant === 'my-transfers' ? 'mer-multi' : 'mixed-multi';
    switch (currentStep) {
      case 0:
        return (
          <ControlSelector
            mode={controlMode}
            selectedControls={selectedControls}
            onSelectionChange={setSelectedControls}
            recentControls={recentControls}
          />
        );
      case 1:
        return (
          <MERTypeSelector
            selectedMERType={selectedMERType}
            onSelect={handleMERTypeSelect}
            allowedMerTypes={allowedMerTypes}
          />
        );
      case 2:
        if (isMERControl) {
          return (
            <ApplicationIdentificationStep
              onDataFetched={handleApplicationDataFetched}
              currentData={applicationData}
            />
          );
        }
        return <TransferDetails control={selectedControl} />;
      case 3:
        if (isMERControl) {
          if (applicationData && merTemplate && !uploadedTemplate) {
            return (
              <Suspense fallback={<LazyFallback>Loading template…</LazyFallback>}>
                <MERTemplateReview template={merTemplate} onContinue={handleMERTemplateComplete} />
              </Suspense>
            );
          }
          if (applicationData && uploadedTemplate) {
            if (uploadedTemplate.templateType === 'DYNAMIC_FORM') {
              return (
                <Suspense fallback={<LazyFallback>Loading form…</LazyFallback>}>
                  <DynamicTemplateForm
                    template={uploadedTemplate}
                    prefillData={applicationData}
                    onContinue={handlePDFTemplateComplete}
                    onSectionStatusesChange={setSectionStatuses}
                  />
                </Suspense>
              );
            }
            return (
              <Suspense fallback={<LazyFallback>Loading PDF viewer…</LazyFallback>}>
                <PDFTemplateViewer
                  template={uploadedTemplate}
                  prefillData={applicationData}
                  onContinue={handlePDFTemplateComplete}
                />
              </Suspense>
            );
          }
          return (
            <div style={{ color: colors.text.tertiary, fontSize: '0.875rem', padding: spacing.lg }}>
              Please complete the Application Identification step first.
            </div>
          );
        }
        return (
          <InventoryQuestionnaire
            onComplete={handleQuestionnaireComplete}
            questionnaireData={questionnaireData}
          />
        );
      case 4:
        return (
          <FileManager
            isMER={isMERControl}
            questionnaireData={isMERControl ? undefined : questionnaireData}
            transferId={currentTransferId}
            onEvidenceUploaded={handleEvidenceUploaded}
            uploadedEvidence={uploadedEvidence}
          />
        );
      case 5:
        return (
          <ReviewStep
            isMER={isMERControl}
            selectedControl={selectedControl}
            selectedControls={selectedControls}
            selectedMERType={selectedMERType}
            applicationData={applicationData}
            merTemplate={merTemplate}
            uploadedTemplate={uploadedTemplate}
            questionnaireData={questionnaireData}
            uploadedEvidence={uploadedEvidence}
            currentTransferId={currentTransferId}
          />
        );
      default:
        return null;
    }
  };

  const sidebarTitle =
    isMERControl && selectedControl
      ? `MER · ${selectedControl.applicationName}`
      : selectedControl
        ? selectedControl.applicationName
        : 'New Request';

  return (
    <PageShell>
      {showWorkflowSidebar && (
        <StepSidebar
          steps={workflowSteps}
          currentStep={currentStep}
          onStepClick={handleSidebarStepClick}
          title={sidebarTitle}
          subNavItems={subNavItems}
          onSubNavClick={handleSubNavClick}
        />
      )}

      <MainArea>
        <MainScroll>
          <PageHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
              {variant === 'my-transfers' && onNavigateBack && (
                <BackLink type="button" onClick={onNavigateBack}>
                  <FiArrowLeft size={16} aria-hidden />
                  Back to My Transfers
                </BackLink>
              )}
              <PageTitle>{pageTitle}</PageTitle>
              {selectedControl && (
                <WorkflowBadge>
                  {isMERControl ? `MER ${selectedMERType || ''}`.trim() : 'Data Transfer'}
                </WorkflowBadge>
              )}
            </div>
          </PageHeader>

          {merUseBreadcrumbs && currentStep <= 2 && (
            <MerWorkflowSetupBreadcrumbs
              currentStepIndex={currentStep > 2 ? 2 : currentStep}
              allComplete={currentStep > 2}
            />
          )}

          {merUseBreadcrumbs && currentStep >= 3 && (
            <PostTemplateNav aria-label="MER submission steps">
              <PostStep $active={currentStep === 3} $done={currentStep > 3}>
                MER template
              </PostStep>
              <PostStep $active={currentStep === 4} $done={currentStep > 4}>
                Evidence (optional)
              </PostStep>
              <PostStep $active={currentStep === 5} $done={isSubmitted}>
                Review &amp; submit
              </PostStep>
            </PostTemplateNav>
          )}

          {completedSummaries.length > 0 && (
            <CompletedSummariesArea aria-label="Completed steps">
              {completedSummaries.map(summary => (
                <SummaryCard key={summary.id}>
                  <SummaryIcon aria-hidden="true">{summary.icon}</SummaryIcon>
                  <SummaryContent>
                    <SummaryLabel>{summary.label}</SummaryLabel>
                    <SummaryValue title={summary.value}>{summary.value}</SummaryValue>
                  </SummaryContent>
                  <EditButton
                    onClick={() => dispatch({ type: 'NAVIGATE_BACK_TO', step: summary.editStep })}
                    aria-label={`Edit ${summary.label}`}
                  >
                    <FiEdit2 size={12} />
                    Edit
                  </EditButton>
                </SummaryCard>
              ))}
            </CompletedSummariesArea>
          )}

          {!isSubmitted && (
            <ActiveStepCard role="region" aria-labelledby="active-step-heading">
              {showSectionRail && incompleteSections.length > 0 && (
                <ValidationBanner role="status">
                  Some sections still need attention:{' '}
                  {incompleteSections.map(s => s.title).join(', ')}
                </ValidationBanner>
              )}
              <ActiveStepHeader>
                <ActiveStepIcon aria-hidden="true">{stepInfo.icon}</ActiveStepIcon>
                <ActiveStepTitle id="active-step-heading">{stepInfo.title}</ActiveStepTitle>
              </ActiveStepHeader>
              {showSectionRail ? (
                <TemplateRow>
                  <StepperRail>
                    <MerSectionStepper
                      sectionIdsOrdered={sectionOrder}
                      statuses={sectionStatuses}
                      activeSectionId={activeTemplateSectionId ?? sectionOrder[0]?.id ?? null}
                      onSectionSelect={handleSectionSelect}
                    />
                  </StepperRail>
                  <TemplateMain>{renderActiveStepContent()}</TemplateMain>
                </TemplateRow>
              ) : (
                renderActiveStepContent()
              )}
            </ActiveStepCard>
          )}

          {isSubmitted && (
            <SuccessBanner role="status" aria-live="polite">
              <span style={{ fontSize: '1.5rem' }}>✓</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Request submitted successfully!</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.85 }}>
                  Transfer request #{currentTransferId} has been submitted. You will receive a notification when the
                  admin reviews your submission.
                </div>
              </div>
            </SuccessBanner>
          )}
        </MainScroll>

        {!isSubmitted && (
          <StepActions
            showBack={stepsActionsConfig.showBack}
            onBack={stepsActionsConfig.onBack}
            showContinue={stepsActionsConfig.showContinue}
            onContinue={handleStepActionsContinue}
            canContinue={stepsActionsConfig.canContinue}
            disabledReason={stepsActionsConfig.disabledReason}
            continueLabel={stepsActionsConfig.continueLabel}
            isSubmit={stepsActionsConfig.isSubmit}
            isLoading={stepsActionsConfig.isLoading}
          />
        )}
      </MainArea>
    </PageShell>
  );
};

export default MerWorkflowLayout;
