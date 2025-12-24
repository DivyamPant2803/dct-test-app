import { TemplateSection, TemplateField, TableConfig, TableColumn } from '../types/index';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local file to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Template Parser Interface
 * This allows swapping between different parsing strategies (PDF parsing, AI, manual)
 */
export interface TemplateParser {
    parse(file: File): Promise<TemplateSection[]>;
}

/**
 * PDF Text-based Parser (Option 1)
 * Uses pattern recognition to extract form structure from PDF text
 */
export class PDFTextParser implements TemplateParser {
    async parse(file: File): Promise<TemplateSection[]> {
        const text = await this.extractTextFromPDF(file);
        return this.analyzeText(text);
    }

    private async extractTextFromPDF(file: File): Promise<string> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            console.log('[TemplateParser] Extracted text length:', fullText.length);
            console.log('[TemplateParser] First 500 chars:', fullText.substring(0, 500));
            return fullText;
        } catch (error) {
            console.error('[TemplateParser] PDF extraction failed:', error);
            throw new Error(`Failed to extract text from PDF: ${error}`);
        }
    }

    private analyzeText(text: string): TemplateSection[] {
        const sections: TemplateSection[] = [];

        // Pattern 1: Detect sections by headers (e.g., "Section A:", "Software Component Information")
        const sectionHeaders = this.detectSectionHeaders(text);

        if (sectionHeaders.length === 0) {
            // Fallback: Create a single section if no headers detected
            sections.push({
                id: 'section-0',
                title: 'General Information',
                description: '',
                fields: this.detectFields(text),
                order: 0,
            });
            return sections;
        }

        // Create sections from detected headers
        sectionHeaders.forEach((header, index) => {
            const nextHeader = sectionHeaders[index + 1];
            const sectionText = nextHeader
                ? text.substring(text.indexOf(header), text.indexOf(nextHeader))
                : text.substring(text.indexOf(header));

            const fields = this.detectFields(sectionText);

            sections.push({
                id: `section-${index}`,
                title: this.cleanSectionTitle(header),
                description: '',
                fields,
                order: index,
            });
        });

        console.log('[TemplateParser] Generated sections:', sections.length);
        sections.forEach((s, i) => {
            console.log(`[TemplateParser] Section ${i}: "${s.title}" with ${s.fields.length} fields`);
        });

        return sections;
    }

    private detectSectionHeaders(text: string): string[] {
        const headers: string[] = [];

        // Pattern: "Section X:" or "Section X" or headers with all caps
        const patterns = [
            /Section\s+[A-Z0-9]+:?/gi,
            /^[A-Z][A-Za-z\s]+Information/gm,
            /^[A-Z\s]{10,}$/gm, // All caps lines (likely headers)
        ];

        patterns.forEach((pattern, idx) => {
            const matches = text.match(pattern);
            if (matches) {
                console.log(`[TemplateParser] Pattern ${idx} matched:`, matches);
                headers.push(...matches);
            }
        });

        const uniqueHeaders = [...new Set(headers)];
        console.log('[TemplateParser] Detected section headers:', uniqueHeaders);
        return uniqueHeaders;
    }

    private cleanSectionTitle(title: string): string {
        return title
            .replace(/:/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }

    private detectFields(text: string): TemplateField[] {
        const fields: TemplateField[] = [];
        let fieldIndex = 0;

        // Pattern 1: Detect form labels (text followed by colon or underscore)
        const labelPatterns = [
            /([A-Za-z\s]+):/g,  // "SWC ID:", "SWC Name:"
            /([A-Za-z\s]+)_+/g, // "SWC ID_____"
        ];

        const detectedLabels = new Set<string>();

        labelPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const label = match[1].trim();

                // Filter out noise (single words, too long, etc.)
                if (label.length < 3 || label.length > 50 || detectedLabels.has(label)) {
                    continue;
                }

                // Skip common words that aren't field labels
                if (this.isCommonWord(label)) {
                    continue;
                }

                detectedLabels.add(label);

                fields.push({
                    id: `field-${fieldIndex++}`,
                    label,
                    type: 'text',
                    required: false,
                    order: fieldIndex,
                    placeholder: `Enter ${label.toLowerCase()}`,
                });
            }
        });

        // Pattern 2: Detect tables
        const tableConfig = this.detectTable(text);
        if (tableConfig && tableConfig.columns.length > 0) {
            fields.push({
                id: `field-table-${fieldIndex++}`,
                label: 'Details Table',
                type: 'table',
                required: false,
                order: fieldIndex,
                tableConfig,
            });
        }

        return fields;
    }

    private detectTable(text: string): TableConfig | null {
        // Detect table by finding repeated column headers in a line
        const lines = text.split('\n');

        for (const line of lines) {
            // Look for lines with multiple capitalized words (potential headers)
            const words = line.split(/\s{2,}/); // Split by 2+ spaces

            if (words.length >= 3) {
                const potentialHeaders = words.filter(w =>
                    w.trim().length > 0 &&
                    /^[A-Z]/.test(w) &&
                    w.length < 30
                );

                if (potentialHeaders.length >= 3) {
                    // Found a table header row
                    const columns: TableColumn[] = potentialHeaders.map((header, idx) => ({
                        id: `col-${idx}`,
                        label: header.trim(),
                        type: 'text',
                        required: false,
                    }));

                    return {
                        columns,
                        minRows: 2,
                        allowAddRows: true,
                        allowDeleteRows: true,
                    };
                }
            }
        }

        return null;
    }

    private isCommonWord(word: string): boolean {
        const commonWords = [
            'the', 'and', 'for', 'are', 'where', 'who', 'what', 'when',
            'does', 'please', 'fill', 'all', 'boxes', 'with', 'information',
            'requested', 'each', 'following', 'above', 'below', 'yes', 'no'
        ];
        return commonWords.includes(word.toLowerCase());
    }
}

/**
 * AI-based Parser (Option 3 - Future)
 * Placeholder for future AI-powered parsing
 */
export class AITemplateParser implements TemplateParser {
    async parse(file: File): Promise<TemplateSection[]> {
        // TODO: Implement AI-based parsing
        // 1. Extract PDF text or convert to image
        // 2. Send to Gemini/GPT with prompt
        // 3. Parse JSON response
        throw new Error('AI parsing not yet implemented. Use PDFTextParser for now.');
    }
}

/**
 * Hybrid Parser (Option 3)
 * Try PDF parsing first, fall back to AI if confidence is low
 */
export class HybridTemplateParser implements TemplateParser {
    private pdfParser = new PDFTextParser();
    private aiParser = new AITemplateParser();
    private confidenceThreshold = 0.7;

    async parse(file: File): Promise<TemplateSection[]> {
        // Try PDF text parsing first
        const sections = await this.pdfParser.parse(file);

        // Calculate confidence score
        const confidence = this.calculateConfidence(sections);

        if (confidence >= this.confidenceThreshold) {
            return sections;
        }

        // Low confidence - try AI parsing
        console.log(`PDF parsing confidence low (${confidence}). Attempting AI parsing...`);
        try {
            return await this.aiParser.parse(file);
        } catch (error) {
            console.warn('AI parsing failed, using PDF parsing results', error);
            return sections;
        }
    }

    private calculateConfidence(sections: TemplateSection[]): number {
        // Simple heuristic: more sections and fields = higher confidence
        if (sections.length === 0) return 0;

        const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);

        // Confidence based on structure completeness
        if (sections.length >= 2 && totalFields >= 5) return 0.9;
        if (sections.length >= 1 && totalFields >= 3) return 0.7;
        if (totalFields >= 1) return 0.5;

        return 0.3;
    }
}

/**
 * Factory function to get the appropriate parser
 */
export function getTemplateParser(strategy: 'pdf' | 'ai' | 'hybrid' = 'pdf'): TemplateParser {
    switch (strategy) {
        case 'ai':
            return new AITemplateParser();
        case 'hybrid':
            return new HybridTemplateParser();
        case 'pdf':
        default:
            return new PDFTextParser();
    }
}
