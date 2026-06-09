import { ZodError } from 'zod';
import { configJsonSchema } from './schemas';
import { ConfigJson } from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * Validate a ConfigJson document against all §6 rules (Zod client-side mirror).
 * Server remains authoritative; this provides immediate field-level feedback.
 */
export function validateConfig(config: ConfigJson): ValidationResult {
  try {
    configJsonSchema.parse(config);
    return { ok: true, errors: [] };
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = e.issues.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
      });
      return { ok: false, errors };
    }
    return { ok: false, errors: ['Unknown validation error'] };
  }
}
