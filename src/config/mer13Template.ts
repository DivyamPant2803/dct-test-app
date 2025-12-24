/**
 * MER-13 Template Configuration
 * 
 * This file contains the complete configuration for the MER-13 CID Access Control template.
 * The template is structured according to the actual MER-13 PDF with:
 * - Header: Software Component Information (prefilled)
 * - Section A: CID Access and User Location Table
 * - Section B: Application Details with conditional fields
 * - Section C: Access Compliance
 * - Attachments: Required document uploads
 */

import { UploadedTemplate, TemplateSection } from '../types/index';

// User Location Table Configuration
const userLocationTableConfig = {
    columns: [
        { id: 'instanceId', label: 'Instance ID', type: 'text' as const, required: true },
        {
            id: 'userType', label: 'User Type', type: 'select' as const,
            options: ['Internal', 'External', 'Vendor', 'Contractor']
        },
        { id: 'entityName', label: 'Entity Name', type: 'text' as const },
        { id: 'businessDivision', label: 'Business Division', type: 'text' as const },
        { id: 'accessLocation', label: 'Access Location', type: 'text' as const },
        {
            id: 'isCidWaived', label: 'Is CID Waived', type: 'select' as const,
            options: ['Yes', 'No']
        },
        {
            id: 'locationApproved', label: 'Location Approved', type: 'select' as const,
            options: ['Yes', 'No', 'Pending']
        }
    ],
    minRows: 1,
    maxRows: 50,
    allowAddRows: true,
    allowDeleteRows: true
};

// Complete MER-13 Template Sections
const MER13_SECTIONS: TemplateSection[] = [
    // ============================================================================
    // HEADER: Software Component Information
    // ============================================================================
    {
        id: 'header',
        title: 'Software Component Information',
        description: 'Basic identification information for the software component. These fields are automatically populated from your system records.',
        order: 0,
        collapsible: true,
        defaultCollapsed: false,
        fields: [
            {
                id: 'swcId',
                label: 'SWC ID',
                type: 'text',
                required: true,
                order: 0,
                width: 'third',
                prefillSource: 'swcId',
                prefillEditable: true,
                helpText: 'Software Component Identifier'
            },
            {
                id: 'swcName',
                label: 'SWC Name',
                type: 'text',
                required: true,
                order: 1,
                width: 'third',
                prefillSource: 'swcName',
                prefillEditable: true
            },
            {
                id: 'swcManager',
                label: 'SWC Manager',
                type: 'text',
                required: true,
                order: 2,
                width: 'third',
                prefillSource: 'swcManager',
                prefillEditable: true
            }
        ]
    },

    // ============================================================================
    // SECTION A: CID Access
    // ============================================================================
    {
        id: 'sectionA',
        title: 'Section A: CID Access',
        description: 'Information about user access to Client Identifying Data (CID).',
        order: 1,
        collapsible: true,
        defaultCollapsed: false,
        fields: [
            {
                id: 'allowsCidAccess',
                label: 'Does the app allow users to access CID?',
                type: 'radio',
                options: ['Yes', 'No'],
                required: true,
                order: 0,
                width: 'full',
                prefillSource: 'allowsCidAccess',
                prefillEditable: true
            },
            {
                id: 'userLocationTable',
                label: 'Where are the users located who are accessing the CID?',
                type: 'table',
                tableConfig: userLocationTableConfig,
                required: false,
                order: 1,
                width: 'full',
                helpText: 'Add a row for each user group accessing CID',
                condition: {
                    dependsOn: 'allowsCidAccess',
                    showWhen: 'Yes'
                }
            }
        ]
    },

    // ============================================================================
    // SECTION B: Application Details
    // ============================================================================
    {
        id: 'sectionB',
        title: 'Section B: Application Details',
        description: 'Detailed information about the application, data handling, and security solutions.',
        order: 2,
        collapsible: true,
        defaultCollapsed: false,
        fields: [
            {
                id: 'applicationPurpose',
                label: 'Purpose of the application',
                type: 'textarea',
                required: true,
                order: 0,
                width: 'full',
                placeholder: 'Describe the main purpose and functionality of this application...',
                prefillSource: 'applicationPurpose',
                prefillEditable: true
            },
            {
                id: 'handlesCid',
                label: 'Does the application handle CID?',
                type: 'radio',
                options: ['Yes', 'No'],
                required: true,
                order: 1,
                width: 'half',
                prefillSource: 'handlesCid',
                prefillEditable: true
            },
            {
                id: 'dataHandlingExplanation',
                label: 'Please explain how data is handled relevant to location aware access in detail',
                type: 'textarea',
                required: false,
                order: 2,
                width: 'full',
                placeholder: 'Provide details about data handling processes...',
                condition: {
                    dependsOn: 'handlesCid',
                    showWhen: 'Yes'
                }
            },
            {
                id: 'cidDataType',
                label: 'What is CID Data Type?',
                type: 'radio-group',
                options: ['Natural CID', 'Corporate CID'],
                required: false,
                order: 3,
                width: 'half',
                prefillSource: 'cidDataType',
                prefillEditable: true,
                condition: {
                    dependsOn: 'handlesCid',
                    showWhen: 'Yes'
                }
            },
            {
                id: 'dataCategorization',
                label: 'What is Data Categorization?',
                type: 'radio-group',
                options: ['A', 'B', 'C'],
                required: false,
                order: 4,
                width: 'half',
                prefillSource: 'dataCategorization',
                prefillEditable: true,
                condition: {
                    dependsOn: 'handlesCid',
                    showWhen: 'Yes'
                }
            },
            {
                id: 'laacSolution',
                label: 'Select the LAAC solution implemented',
                type: 'radio-group',
                options: ['Azure AD', 'ISSO', 'Other (Please specify)'],
                required: false,
                order: 5,
                width: 'full',
                prefillSource: 'laacSolution',
                prefillEditable: true
            },
            {
                id: 'laacExplanation',
                label: 'Please explain the LAAC solution in detail',
                type: 'textarea',
                required: false,
                order: 6,
                width: 'full',
                placeholder: 'Include any visual representations or data models...',
                helpText: 'Provide detailed explanation of your LAAC implementation',
                condition: {
                    dependsOn: 'laacSolution',
                    showWhen: ['Azure AD', 'ISSO', 'Other (Please specify)']
                }
            },
            {
                id: 'higherEnvCid',
                label: 'Does higher environment have CID?',
                type: 'radio',
                options: ['Yes', 'No'],
                required: false,
                order: 7,
                width: 'half'
            },
            {
                id: 'solutionReplicated',
                label: 'If yes, is the same solution replicated to lower environment?',
                type: 'radio',
                options: ['Yes', 'No'],
                required: false,
                order: 8,
                width: 'half',
                condition: {
                    dependsOn: 'higherEnvCid',
                    showWhen: 'Yes'
                }
            }
        ]
    },

    // ============================================================================
    // SECTION C: Access Compliance
    // ============================================================================
    {
        id: 'sectionC',
        title: 'Section C: Access Compliance',
        description: 'Compliance verification for CID access from approved locations.',
        order: 3,
        collapsible: true,
        defaultCollapsed: false,
        fields: [
            {
                id: 'cidOutsideApproved',
                label: 'Is CID accessed out of approved access locations?',
                type: 'radio',
                options: ['Yes', 'No'],
                required: true,
                order: 0,
                width: 'full'
            },
            {
                id: 'complianceEvidence',
                label: 'Compliance Evidence',
                type: 'file-multiple',
                required: false,
                order: 1,
                width: 'full',
                helpText: 'Provide attachment to show explicit compliance, OR if CID is waived provide relevant evidence, OR if access is outside approved location provide legal exception approval',
                fileConfig: {
                    accept: ['.pdf', '.doc', '.docx', '.png', '.jpg'],
                    maxSizeMB: 10,
                    multiple: true
                },
                condition: {
                    dependsOn: 'cidOutsideApproved',
                    showWhen: 'Yes'
                }
            }
        ]
    },

    // ============================================================================
    // ATTACHMENTS: Required Documents
    // ============================================================================
    {
        id: 'attachments',
        title: 'Required Attachments',
        description: 'Please upload the following required documentation.',
        order: 4,
        collapsible: true,
        defaultCollapsed: false,
        fields: [
            {
                id: 'architectureDoc',
                label: 'Attach Architecture document',
                type: 'file',
                required: true,
                order: 0,
                width: 'full',
                fileConfig: {
                    accept: ['.pdf', '.doc', '.docx', '.pptx'],
                    maxSizeMB: 25,
                    multiple: false
                }
            },
            {
                id: 'technicalSolutionDoc',
                label: 'Attach technical solution document',
                type: 'file',
                required: true,
                order: 1,
                width: 'full',
                fileConfig: {
                    accept: ['.pdf', '.doc', '.docx'],
                    maxSizeMB: 25,
                    multiple: false
                }
            }
        ]
    }
];

// ============================================================================
// Complete MER-13 Template
// ============================================================================
export const MER_13_TEMPLATE: UploadedTemplate = {
    id: 'mer-13-template',
    name: 'MER-13: CID Access Control',
    description: 'Template for documenting Client Identifying Data (CID) access controls, LAAC solutions, and compliance evidence.',
    status: 'ACTIVE',
    templateType: 'DYNAMIC_FORM',
    controlType: 'MER-13',
    version: '1.0.0',

    // File metadata (placeholder - would be actual PDF in production)
    originalFileName: 'MER_13_Template.pdf',
    fileSize: 0,
    documentType: 'PDF',
    pdfBase64: '', // Would contain actual PDF base64 in production

    // Dynamic form sections
    sections: MER13_SECTIONS,

    // Field mappings for prefill from ApplicationData
    fieldMappings: {
        'swcId': 'swcId',
        'swcName': 'swcName',
        'swcManager': 'swcManager',
        'applicationPurpose': 'applicationPurpose',
        'handlesCid': 'handlesCid',
        'allowsCidAccess': 'allowsCidAccess',
        'cidDataType': 'cidDataType',
        'dataCategorization': 'dataCategorization',
        'laacSolution': 'laacSolution'
    },

    // Tracking
    uploadedBy: 'System',
    uploadedAt: new Date().toISOString(),
    usageCount: 0
};

/**
 * Get the MER-13 template
 */
export const getMER13Template = (): UploadedTemplate => {
    return { ...MER_13_TEMPLATE };
};

/**
 * Get available MER templates
 */
export const getAvailableMERTemplates = (): UploadedTemplate[] => {
    return [MER_13_TEMPLATE];
};
