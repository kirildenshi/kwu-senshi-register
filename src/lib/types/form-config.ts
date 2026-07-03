export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'file'
  | 'checkbox';

export type FormSection =
  | 'personal'
  | 'contact'
  | 'identity'
  | 'martialArts'
  | 'dojoDetails'
  | 'credentials'
  | 'documents'
  | 'territory';

export interface FormFieldConfig {
  section: FormSection;
  name: string;
  type: FormFieldType;
  required: boolean;
  label: string;
  options?: string[];
  /** If set, select options are fetched at runtime from the named public API instead of `options`. */
  dataSource?: 'leaders' | 'dojos' | '';
  /** Runtime-resolved options populated by FormRenderer when dataSource is set. Not stored in CMS. */
  resolvedOptions?: Array<{ value: string; label: string }>;
  accept?: string;
  visibleWhen?: Record<string, string>;
  min?: string;
  max?: string;
}

export interface FormConfigResponse {
  id: string | number;
  role: string;
  region: string;
  version: number;
  active: boolean;
  fields: FormFieldConfig[];
}

export const SECTION_ORDER: FormSection[] = [
  'personal',
  'contact',
  'dojoDetails',
  'martialArts',
  'territory',
  'credentials',
  'documents',
];

/** Fields removed from the registration flow — filtered out regardless of CMS config. */
export const REMOVED_FIELDS = [
  'fatherName', 'motherName', 'medicalInsurance',
  'teacherName', 'heightCm', 'weightKg', 'trainingStart',
  'photo',
] as const;

export const ACCOUNT_FIELDS = ['password', 'confirmPassword'] as const;

/**
 * Forced field order within a section — fields listed here are sorted to the
 * end of that section regardless of the order stored in the CMS.
 */
const FIELDS_LAST: Partial<Record<FormSection, string[]>> = {
  contact: ['telephone'],
};

export function groupFieldsBySection(
  fields: FormFieldConfig[],
  pinnedLast: Partial<Record<FormSection, string[]>> = FIELDS_LAST,
): Record<FormSection, FormFieldConfig[]> {
  const grouped = {} as Record<FormSection, FormFieldConfig[]>;
  // Filter out removed fields first
  const active = fields.filter((f) => !(REMOVED_FIELDS as readonly string[]).includes(f.name));
  for (const section of SECTION_ORDER) {
    const sectionFields = active.filter((f) => {
      // Merge legacy 'identity' section into 'credentials'
      const effectiveSection = f.section === 'identity' ? 'credentials' : f.section;
      return effectiveSection === section;
    });

    // Enforce any pinned-to-end fields
    const last = pinnedLast[section] ?? [];
    if (last.length > 0) {
      const pinned = sectionFields.filter((f) => last.includes(f.name));
      const rest = sectionFields.filter((f) => !last.includes(f.name));
      grouped[section] = [...rest, ...pinned];
    } else {
      grouped[section] = sectionFields;
    }
  }
  return grouped;
}
