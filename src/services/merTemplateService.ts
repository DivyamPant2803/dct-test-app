import { MERType, MERTemplate, MERTemplateField } from '../types/index';

/**
 * MER Template Service
 * Manages MER templates (MER-13, MER-14) with CRUD operations and data prefill
 */

const STORAGE_KEY_PREFIX = 'mer_template_';

// MER-13 Template Definition
const MER_13_TEMPLATE: MERTemplate = {
    id: 'mer-13-v1',
    merType: 'MER-13',
    version: '1.0.0',
    description: 'MER-13: Data Classification and Location Tracking',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    fields: [
        {
            id: 'appName',
            label: 'Application Name',
            value: '',
            editable: false, // Will be prefilled from app data
            required: true,
            type: 'text',
            placeholder: 'Enter application name',
            helpText: 'Official name of the application'
        },
        {
            id: 'appId',
            label: 'Application ID',
            value: '',
            editable: false,
            required: true,
            type: 'text',
            placeholder: 'APP-XXXX-XXX',
            helpText: 'Unique application identifier'
        },
        {
            id: 'swcManager',
            label: 'SWC Manager',
            value: '',
            editable: true, // User can edit
            required: true,
            type: 'text',
            placeholder: 'Enter SWC manager name',
            helpText: 'Software Compliance Manager responsible for this application'
        },
        {
            id: 'locations',
            label: 'Data Storage Locations',
            value: '',
            editable: true,
            required: true,
            type: 'textarea',
            placeholder: 'e.g., US-East, EU-West, Asia-Pacific',
            helpText: 'Geographic locations where data is stored (comma-separated)'
        },
        {
            id: 'dataType',
            label: 'Data Type / Classification',
            value: '',
            editable: true,
            required: true,
            type: 'select',
            options: ['Public', 'Internal', 'Confidential', 'Restricted', 'Sensitive'],
            helpText: 'Data classification level for this application'
        },
        {
            id: 'dataCategories',
            label: 'Data Categories',
            value: '',
            editable: true,
            required: false,
            type: 'textarea',
            placeholder: 'e.g., PII, PHI, Financial Data',
            helpText: 'Types of data stored in this application'
        },
        {
            id: 'complianceNotes',
            label: 'Compliance Notes',
            value: '',
            editable: true,
            required: false,
            type: 'textarea',
            placeholder: 'Additional compliance-related notes',
            helpText: 'Any special compliance considerations or requirements'
        }
    ]
};

// MER-14 Template Definition
const MER_14_TEMPLATE: MERTemplate = {
    id: 'mer-14-v1',
    merType: 'MER-14',
    version: '1.0.0',
    description: 'MER-14: Hosting and Architecture Documentation',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    fields: [
        {
            id: 'appName',
            label: 'Application Name',
            value: '',
            editable: false,
            required: true,
            type: 'text',
            placeholder: 'Enter application name',
            helpText: 'Official name of the application'
        },
        {
            id: 'appId',
            label: 'Application ID',
            value: '',
            editable: false,
            required: true,
            type: 'text',
            placeholder: 'APP-XXXX-XXX',
            helpText: 'Unique application identifier'
        },
        {
            id: 'swcManager',
            label: 'SWC Manager',
            value: '',
            editable: true,
            required: true,
            type: 'text',
            placeholder: 'Enter SWC manager name',
            helpText: 'Software Compliance Manager responsible for this application'
        },
        {
            id: 'hostingLocations',
            label: 'Hosting Locations',
            value: '',
            editable: true,
            required: true,
            type: 'textarea',
            placeholder: 'e.g., AWS US-East-1, Azure West Europe',
            helpText: 'Cloud provider and regions where application is hosted'
        },
        {
            id: 'architectureDiagram',
            label: 'Architecture Diagram',
            value: '',
            editable: true,
            required: false,
            type: 'file',
            helpText: 'Upload architecture diagram (PDF, PNG, or link to document)'
        },
        {
            id: 'deploymentModel',
            label: 'Deployment Model',
            value: '',
            editable: true,
            required: true,
            type: 'select',
            options: ['On-Premises', 'Public Cloud', 'Private Cloud', 'Hybrid', 'Multi-Cloud'],
            helpText: 'Application deployment architecture'
        },
        {
            id: 'scalabilityNotes',
            label: 'Scalability & HA Notes',
            value: '',
            editable: true,
            required: false,
            type: 'textarea',
            placeholder: 'Describe scaling strategy and high availability setup',
            helpText: 'Details about application scalability and redundancy'
        },
        {
            id: 'drStrategy',
            label: 'Disaster Recovery Strategy',
            value: '',
            editable: true,
            required: false,
            type: 'textarea',
            placeholder: 'Describe backup and recovery procedures',
            helpText: 'Disaster recovery and business continuity plan'
        }
    ]
};

/**
 * Get MER template by type
 * @param merType - 'MER-13' or 'MER-14'
 * @returns MER template object
 */
export const getMERTemplate = (merType: MERType): MERTemplate => {
    const template = merType === 'MER-13' ? MER_13_TEMPLATE : MER_14_TEMPLATE;

    // Return a deep copy to avoid mutations
    return JSON.parse(JSON.stringify(template));
};

/**
 * Prefill template with application data
 * @param template - MER template
 * @param appData - Application data from multiple sources
 * @returns Prefilled template
 */
export const prefillTemplateWithAppData = (
    template: MERTemplate,
    appData: {
        applicationName?: string;
        applicationId?: string;
        owner?: string;
        dataClassification?: string;
        locations?: string[];
        hostingProvider?: string;
        deploymentModel?: string;
    }
): MERTemplate => {
    const prefilledTemplate = { ...template };

    prefilledTemplate.fields = template.fields.map((field: MERTemplateField) => {
        const updatedField = { ...field };

        // Prefill based on field ID
        switch (field.id) {
            case 'appName':
                updatedField.value = appData.applicationName || '';
                break;
            case 'appId':
                updatedField.value = appData.applicationId || '';
                break;
            case 'swcManager':
                updatedField.value = appData.owner || '';
                break;
            case 'dataType':
                updatedField.value = appData.dataClassification || '';
                break;
            case 'locations':
                updatedField.value = appData.locations?.join(', ') || '';
                break;
            case 'hostingLocations':
                updatedField.value = appData.hostingProvider || '';
                break;
            case 'deploymentModel':
                updatedField.value = appData.deploymentModel || '';
                break;
            default:
                // Keep default empty value
                break;
        }

        return updatedField;
    });

    return prefilledTemplate;
};

/**
 * Save filled template to localStorage
 * @param  template - Completed MER template
 */
export const saveMERTemplate = (template: MERTemplate): void => {
    const storageKey = `${STORAGE_KEY_PREFIX}${template.id}`;
    localStorage.setItem(storageKey, JSON.stringify(template));
};

/**
 * Load template from localStorage
 * @param templateId - Template ID
 * @returns Saved template or null
 */
export const loadMERTemplate = (templateId: string): MERTemplate | null => {
    const storageKey = `${STORAGE_KEY_PREFIX}${templateId}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to parse MER template:', error);
        return null;
    }
};

/**
 * Extract filled values from template
 * @param template - Filled template
 * @returns Field ID → value mapping
 */
export const extractTemplateData = (template: MERTemplate): Record<string, string> => {
    const data: Record<string, string> = {};

    template.fields.forEach(field => {
        data[field.id] = field.value;
    });

    return data;
};
