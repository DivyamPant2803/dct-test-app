import { MERTemplate, MERTemplateField, UploadedTemplate, TemplateStatus, DocumentType, PDFFormField } from '../types/index';
import {
    loadPDF,
    getPDFFormFields,
    getPDFAsBase64,
    hasPDFFormFields,
    generateFieldMappings,
} from '../utils/pdfUtils';

/**
 * Uploaded Template Service
 * Manages uploaded templates with CRUD operations
 * Storage: localStorage (will migrate to cloud later)
 */

const STORAGE_KEY = 'uploaded_templates';
const ACTIVE_TEMPLATE_KEY = 'active_template_id';

/**
 * Get all uploaded templates from localStorage
 */
export const getAllTemplates = (): UploadedTemplate[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load templates:', error);
        return [];
    }
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): UploadedTemplate | null => {
    const templates = getAllTemplates();
    return templates.find(t => t.id === id) || null;
};

/**
 * Get all active templates
 */
export const getActiveTemplates = (): UploadedTemplate[] => {
    const templates = getAllTemplates();
    return templates.filter(t => t.status === 'ACTIVE');
};

/**
 * Get the currently selected active template for Central Inventory
 */
export const getActiveTemplate = (): UploadedTemplate | null => {
    const activeId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    if (!activeId) {
        // Return first active template as default
        const activeTemplates = getActiveTemplates();
        return activeTemplates.length > 0 ? activeTemplates[0] : null;
    }
    return getTemplateById(activeId);
};

/**
 * Set the active template for Central Inventory
 */
export const setActiveTemplate = (templateId: string): void => {
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, templateId);
};

/**
 * Save templates to localStorage
 */
const saveTemplates = (templates: UploadedTemplate[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
        console.error('Failed to save templates:', error);
        throw new Error('Failed to save templates. Storage might be full.');
    }
};

/**
 * Process PDF file and extract form fields
 */
export const processPDFFile = async (file: File): Promise<{
    pdfBase64: string;
    formFields: PDFFormField[];
    hasFormFields: boolean;
    fieldMappings: Record<string, string>;
}> => {
    // Load PDF
    const pdfDoc = await loadPDF(file);

    // Convert to base64 for storage
    const pdfBase64 = await getPDFAsBase64(file);

    // Check if PDF has form fields
    const hasFields = await hasPDFFormFields(pdfDoc);

    // Get form fields
    const formFields = hasFields ? await getPDFFormFields(pdfDoc) : [];

    // Generate default field mappings
    const fieldNames = formFields.map(f => f.name);
    const fieldMappings = generateFieldMappings(fieldNames);

    return {
        pdfBase64,
        formFields,
        hasFormFields: hasFields,
        fieldMappings,
    };
};

/**
 * Create a new uploaded template
 */
export const createTemplate = async (
    file: File,
    metadata: {
        name: string;
        description?: string;
        status: TemplateStatus;
        uploadedBy: string;
        fieldMappings?: Record<string, string>;
    }
): Promise<UploadedTemplate> => {
    const templates = getAllTemplates();

    // Process PDF file
    const { pdfBase64, formFields, hasFormFields, fieldMappings: autoMappings } = await processPDFFile(file);

    const newTemplate: UploadedTemplate = {
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: metadata.name,
        description: metadata.description,
        status: metadata.status,
        templateType: 'PDF_FORM', // PDF-based template with form fields
        originalFileName: file.name,
        fileSize: file.size,
        documentType: getDocumentType(file),
        pdfBase64,
        hasFormFields,
        formFields,
        fieldMappings: metadata.fieldMappings || autoMappings,
        uploadedBy: metadata.uploadedBy,
        uploadedAt: new Date().toISOString(),
        usageCount: 0,
    };

    templates.push(newTemplate);
    saveTemplates(templates);

    return newTemplate;
};

/**
 * Update an existing template
 */
export const updateTemplate = (id: string, updates: Partial<UploadedTemplate>): UploadedTemplate | null => {
    const templates = getAllTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
        console.error('Template not found:', id);
        return null;
    }

    templates[index] = {
        ...templates[index],
        ...updates,
        id, // Ensure ID doesn't change
        uploadedAt: templates[index].uploadedAt, // Preserve upload date
    };

    saveTemplates(templates);
    return templates[index];
};

/**
 * Delete a template
 */
export const deleteTemplate = (id: string): boolean => {
    const templates = getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);

    if (filtered.length === templates.length) {
        console.error('Template not found:', id);
        return false;
    }

    saveTemplates(filtered);

    // Clear active template if it was deleted
    const activeId = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    if (activeId === id) {
        localStorage.removeItem(ACTIVE_TEMPLATE_KEY);
    }

    return true;
};

/**
 * Convert PDF form fields to MERTemplateFields for backward compatibility
 * This allows PDF templates to work with existing MERTemplateReview component
 */
const convertPDFFieldsToMERFields = (pdfFields: PDFFormField[]): MERTemplateField[] => {
    return pdfFields.map(field => ({
        id: field.name,
        label: field.name.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to readable
        value: field.value || '',
        editable: true,
        required: field.required || false,
        type: field.type === 'textarea' ? 'textarea' :
            field.type === 'select' ? 'select' :
                field.type === 'checkbox' ? 'text' : 'text',
        options: field.options,
        placeholder: `Enter ${field.name}`,
    }));
};

/**
 * Convert UploadedTemplate to MERTemplate format for use in Central Inventory
 * This maintains backward compatibility with existing MERTemplateReview component
 */
export const convertToMERTemplate = (template: UploadedTemplate, merType: 'MER-13' | 'MER-14' = 'MER-13'): MERTemplate => {
    return {
        id: template.id,
        merType,
        version: '1.0.0',
        description: template.description || template.name,
        createdAt: template.uploadedAt,
        createdBy: template.uploadedBy,
        fields: convertPDFFieldsToMERFields(template.formFields || []),
    };
};

/**
 * Increment usage count when template is used
 */
export const trackTemplateUsage = (id: string): void => {
    const template = getTemplateById(id);
    if (!template) return;

    updateTemplate(id, {
        usageCount: template.usageCount + 1,
        lastUsedAt: new Date().toISOString(),
    });
};

/**
 * Validate file type
 */
export const validateFileType = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidType = allowedTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)',
        };
    }

    return { valid: true };
};

/**
 * Validate file size (max 10MB for localStorage considerations)
 */
export const validateFileSize = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size exceeds 10MB limit',
        };
    }

    return { valid: true };
};

/**
 * Get document type from file
 */
export const getDocumentType = (file: File): DocumentType => {
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    switch (extension) {
        case '.pdf':
            return 'PDF';
        case '.docx':
            return 'DOCX';
        case '.doc':
            return 'DOC';
        default:
            return 'PDF'; // Default fallback
    }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
