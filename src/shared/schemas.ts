import { z } from 'zod';
import { ALLOWED_ICON_KEYS } from './icons';
import { DATA_PROVIDER_KEYS } from './types';

// §6 validation rules mirrored in Zod (client-side; server is authoritative)

const safeUrlSchema = z.string().refine(
  (val) => {
    if (!val) return true;
    try {
      const u = new URL(val);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'URL must use http or https' }
);

// GUID shape (8-4-4-4-12 hex) — spec §6.2; not strict RFC 4122 version/variant bits
const guidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'Must be a UUID'
  );

export const cardItemSchema = z.object({
  id: guidSchema,
  order: z.number().int().min(1),
  title: z.string().nullable(),
  bodyHtml: z.string().nullable(),
  url: z.union([safeUrlSchema, z.literal(''), z.null()]).optional(),
  iconKey: z
    .string()
    .nullable()
    .refine((k) => !k || ALLOWED_ICON_KEYS.has(k), { message: 'Invalid iconKey' }),
  badgeText: z.string().nullable(),
  effectiveFromUtc: z.string().nullable(),
  effectiveToUtc: z.string().nullable(),
  extra: z.record(z.unknown()).default({}),
});

const cardSizeSchema = z.enum(['Small', 'Medium', 'Large', 'FullWidth']);

// Base card — fields shared across all content models
const baseCardSchema = z.object({
  id: guidSchema,
  type: z.enum(['RichText', 'LinkList', 'NoticeList', 'Timeline', 'Metric', 'Chart', 'ActivityFeed']),
  header: z.string().min(1, 'Header is required'),
  subtitle: z.string().nullable(),
  size: cardSizeSchema,
  order: z.number().int().min(1),
  enabled: z.boolean(),
});

// Prose card
const richTextCardSchema = baseCardSchema.extend({
  type: z.literal('RichText'),
  bodyHtml: z.string().min(1, 'Body HTML is required for RichText cards'),
  items: z.array(z.unknown()).max(0, 'Prose cards must not have items').default([]),
  dataProviderKey: z.null(),
  settings: z.record(z.unknown()).default({}),
});

// Structured cards (LinkList, NoticeList, Timeline)
const structuredCardSchema = baseCardSchema.extend({
  type: z.enum(['LinkList', 'NoticeList', 'Timeline']),
  bodyHtml: z.null(),
  items: z.array(cardItemSchema).min(0),
  dataProviderKey: z.null(),
  settings: z.record(z.unknown()).default({}),
});

// Data cards (Metric, Chart, ActivityFeed)
const dataCardSchema = baseCardSchema.extend({
  type: z.enum(['Metric', 'Chart', 'ActivityFeed']),
  bodyHtml: z.null(),
  items: z.array(z.unknown()).max(0).default([]),
  dataProviderKey: z.enum(DATA_PROVIDER_KEYS as unknown as [string, ...string[]]),
  settings: z.record(z.unknown()).default({}),
});

export const cardSchema = z.discriminatedUnion('type', [
  richTextCardSchema,
  structuredCardSchema,
  dataCardSchema,
]) as z.ZodType<unknown>;

export const roleLayoutSchema = z.object({
  cards: z.array(cardSchema),
});

export const configJsonSchema = z.object({
  schemaVersion: z.literal(1),
  roles: z.record(roleLayoutSchema),
});

export type CardItemFormData = z.infer<typeof cardItemSchema>;
