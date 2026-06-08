const BASE_URL = import.meta.env.VITE_FORM_BUILDER_API_URL || 'http://localhost:4000';

export async function fetchFormSchema(formId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/schemas/${formId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch form schema ${formId}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // The API wraps the schema in a `schema` field
  return data.schema ?? data;
}
