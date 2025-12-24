import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } from 'pdf-lib';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface FormField {
    name: string;
    type: 'text' | 'checkbox' | 'radio' | 'select' | 'textarea';
    value: string;
    required?: boolean;
    options?: string[]; // For select/radio fields
    rect?: number[]; // Position [x, y, width, height]
}

export interface PDFData {
    fields: FormField[];
    hasFormFields: boolean;
    pageCount: number;
}

/**
 * Load PDF from File or Blob
 */
export async function loadPDF(file: File | Blob): Promise<PDFDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc;
}

/**
 * Load PDF for rendering with PDF.js
 */
export async function loadPDFForRendering(file: File | Blob): Promise<pdfjsLib.PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    return pdf;
}

/**
 * Get form fields from PDF using pdf-lib
 */
export async function getPDFFormFields(pdfDoc: PDFDocument): Promise<FormField[]> {
    const form = pdfDoc.getForm();
    const fields: FormField[] = [];

    try {
        const formFields = form.getFields();

        for (const field of formFields) {
            const fieldName = field.getName();
            let fieldType: FormField['type'] = 'text';
            let fieldValue = '';
            let options: string[] | undefined = undefined;

            // Determine field type and get value
            if (field instanceof PDFTextField) {
                fieldType = field.isMultiline() ? 'textarea' : 'text';
                fieldValue = field.getText() || '';
            } else if (field instanceof PDFCheckBox) {
                fieldType = 'checkbox';
                fieldValue = field.isChecked() ? 'true' : 'false';
            } else if (field instanceof PDFDropdown) {
                fieldType = 'select';
                const selected = field.getSelected();
                fieldValue = selected ? selected[0] || '' : '';
                options = field.getOptions();
            }

            fields.push({
                name: fieldName,
                type: fieldType,
                value: fieldValue,
                options,
            });
        }
    } catch (error) {
        console.warn('No form fields found in PDF or error reading fields:', error);
    }

    return fields;
}

/**
 * Prefill PDF form fields with data
 */
export async function prefillPDFFields(
    pdfDoc: PDFDocument,
    data: Record<string, any>
): Promise<PDFDocument> {
    const form = pdfDoc.getForm();

    try {
        const formFields = form.getFields();

        for (const field of formFields) {
            const fieldName = field.getName();
            const value = data[fieldName];

            if (value !== undefined && value !== null) {
                // Set field value based on type
                if (field instanceof PDFTextField) {
                    field.setText(String(value));
                } else if (field instanceof PDFCheckBox) {
                    if (value === true || value === 'true' || value === 'yes') {
                        field.check();
                    } else {
                        field.uncheck();
                    }
                } else if (field instanceof PDFDropdown) {
                    field.select(String(value));
                }
            }
        }
    } catch (error) {
        console.error('Error prefilling PDF fields:', error);
    }

    return pdfDoc;
}

/**
 * Extract data from filled PDF form fields
 */
export async function extractPDFData(pdfDoc: PDFDocument): Promise<Record<string, any>> {
    const form = pdfDoc.getForm();
    const data: Record<string, any> = {};

    try {
        const formFields = form.getFields();

        for (const field of formFields) {
            const fieldName = field.getName();

            if (field instanceof PDFTextField) {
                data[fieldName] = field.getText() || '';
            } else if (field instanceof PDFCheckBox) {
                data[fieldName] = field.isChecked();
            } else if (field instanceof PDFDropdown) {
                const selected = field.getSelected();
                data[fieldName] = selected ? selected[0] || '' : '';
            }
        }
    } catch (error) {
        console.error('Error extracting PDF data:', error);
    }

    return data;
}

/**
 * Render PDF page to canvas using PDF.js
 */
export async function renderPDFPage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5
): Promise<void> {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context not available');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    await page.render(renderContext as any).promise;
}

/**
 * Get PDF as base64 string for storage
 */
export async function getPDFAsBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Convert base64 back to Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'application/pdf'): Blob {
    const base64Data = base64.split(',')[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray as any], { type: mimeType });
}

/**
 * Check if PDF has form fields
 */
export async function hasPDFFormFields(pdfDoc: PDFDocument): Promise<boolean> {
    try {
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        return fields.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Auto-generate field mappings based on common naming patterns
 */
export function generateFieldMappings(fieldNames: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};

    const commonMappings: Record<string, string> = {
        'appname': 'applicationName',
        'applicationname': 'applicationName',
        'app_name': 'applicationName',
        'application_name': 'applicationName',

        'appid': 'applicationId',
        'applicationid': 'applicationId',
        'app_id': 'applicationId',
        'application_id': 'applicationId',

        'swcmanager': 'owner',
        'swc_manager': 'owner',
        'manager': 'owner',
        'owner': 'owner',

        'location': 'locations',
        'locations': 'locations',
        'country': 'locations',
        'countries': 'locations',

        'vendor': 'vendorName',
        'vendorname': 'vendorName',
        'vendor_name': 'vendorName',
    };

    for (const fieldName of fieldNames) {
        const normalizedName = fieldName.toLowerCase().replace(/[\s-]/g, '');

        if (commonMappings[normalizedName]) {
            mappings[fieldName] = commonMappings[normalizedName];
        } else {
            // Default: use camelCase version of field name
            mappings[fieldName] = fieldName;
        }
    }

    return mappings;
}

/**
 * Save modified PDF as Blob
 */
export async function savePDFAsBlob(pdfDoc: PDFDocument): Promise<Blob> {
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}
