import { z } from 'zod';
import { passwordSchema } from './auth';
import { isLatinName, isLatinText } from '@/lib/i18n/latin-text';
import { calculateAge } from '@/lib/utils/age';
import { HIDDEN_FIELDS, GDPR_FIELDS } from '@/components/form/_lib/field-configs';
import type { FormFieldConfig } from '@/lib/types/form-config';

const GDPR_MESSAGE_KEYS: Record<string, string> = {
  acceptTerms: 'accept_terms_required',
  acceptPrivacy: 'accept_privacy_required',
  ageConfirmation: 'age_confirmation_required',
  dataAccuracyDeclaration: 'data_accuracy_required',
};

// Member personal-data fields that must be Latin-script (no Cyrillic).
const LATIN_NAME_FIELDS = new Set(['fullName', 'fatherName', 'motherName', 'teacherName', 'parentFullName']);
const LATIN_TEXT_FIELDS = new Set([
  'naturalCity', 'addressLine1', 'neighborhood', 'city', 'stateProvince',
  'zipCode', 'governmentId', 'medicalInsurance', 'dojoCity',
]);

export function resolveDateToken(token: string | undefined | null): Date | null {
  if (!token) return null;
  if (token === 'today') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(token);
  return Number.isNaN(d.getTime()) ? null : d;
}

// CPF checksum validation (Brazilian tax ID)
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  // Reject known invalid patterns (all same digit)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
}

type Translator = (key: string) => string;

function buildFieldValidator(field: FormFieldConfig, tr: Translator, minAge: number): z.ZodTypeAny {
  switch (field.name) {
    case 'fullName':
      // Latin-script enforcement is added centrally in buildRegistrationSchema
      // (fullName is in LATIN_NAME_FIELDS). Here we only check name *format*.
      return z
        .string()
        .min(2, tr('name_length'))
        .max(80, tr('name_length'))
        .refine((val) => /^[\p{L}\s'\-]+$/u.test(val), {
          message: tr('name_format'),
        });

    case 'dateOfBirth': {
      return z.string().refine(
        (val) => {
          if (!val) return true;
          const age = calculateAge(val);
          if (age === null) return false;
          return age >= minAge && age <= 100;
        },
        { message: tr('minAge') },
      ).refine(
        (val) => {
          if (!val) return true;
          const d = new Date(val);
          const maxDate = resolveDateToken(field.max);
          const minDate = resolveDateToken(field.min);
          if (maxDate && d > maxDate) return false;
          if (minDate && d < minDate) return false;
          return true;
        },
        { message: tr('dateOutOfRange') },
      );
    }

    case 'cpf':
      return z.string().refine((val) => !val || isValidCPF(val), {
        message: tr('cpf_invalid'),
      });

    case 'telephone':
      return z.string().refine(
        (val) => /^\+[1-9]\d{1,14}$/.test(val.replace(/[\s\-().]/g, '')),
        { message: tr('phone_format') },
      );

    case 'parentPhone':
      // Requiredness (when isMinorGuardian is checked) is enforced by the
      // object-level superRefine in buildRegistrationSchema, not here — this
      // field is otherwise optional, so an empty value must pass.
      return z.string().refine(
        (val) => !val || /^\+[1-9]\d{1,14}$/.test(val.replace(/[\s\-().]/g, '')),
        { message: tr('phone_format') },
      );

    case 'heightCm':
      return z.preprocess(
        (v) => (v === '' || v === undefined || v === null || v === 0 ? undefined : Number(v)),
        z.number().min(50, tr('height_range')).max(250, tr('height_range')).optional(),
      );

    case 'weightKg':
      return z.preprocess(
        (v) => (v === '' || v === undefined || v === null || v === 0 ? undefined : Number(v)),
        z.number().min(20, tr('weight_range')).max(300, tr('weight_range')).optional(),
      );

    case 'email':
      return z.string().email(tr('email_invalid'));

    default:
      // Generic validators by type
      switch (field.type) {
        case 'email':
          return z.string().email(tr('email_invalid'));
        case 'number':
          return z.coerce.number();
        case 'checkbox':
          return z.boolean();
        case 'select':
          if (field.options && field.options.length > 0) {
            // Use a string validator with refine instead of z.enum so we can
            // show a generic "required" message instead of Zod's raw enum error.
            return z.string().refine(
              (val) => (field.options as string[]).includes(val),
              { message: tr('required') },
            );
          }
          return z.string().min(1, tr('required'));
        case 'multiselect':
          return z.array(z.string());
        case 'date':
          return z.string().refine(
            (val) => {
              if (!val) return true;
              const d = new Date(val);
              if (isNaN(d.getTime())) return false;
              const maxDate = resolveDateToken(field.max);
              const minDate = resolveDateToken(field.min);
              if (maxDate && d > maxDate) return false;
              if (minDate && d < minDate) return false;
              return true;
            },
            { message: tr('dateOutOfRange') },
          );
        default:
          return z.string();
      }
  }
}

export function buildRegistrationSchema(
  fields: FormFieldConfig[],
  t?: Translator,
  forcedRequired?: Set<string>,
  options?: { minAge?: number; gdprFields?: FormFieldConfig[] },
) {
  const tr: Translator = t ?? ((k: string) => k);
  const minAge = options?.minAge ?? 16;
  const gdprFields = options?.gdprFields ?? GDPR_FIELDS;

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    // File fields validated separately by FileInput component
    if (field.type === 'file') continue;
    // Hidden fields are never rendered, so they must not be validated either —
    // otherwise a hidden-but-required CMS field blocks submission.
    if (HIDDEN_FIELDS.has(field.name)) continue;

    const hasConditionalVisibility = !!field.visibleWhen;
    let validator = buildFieldValidator(field, tr, minAge);
    const isRequired = field.required || forcedRequired?.has(field.name);

    if (isRequired && !hasConditionalVisibility) {
      // Required fields: add min length for strings (except special cases)
      if (
        field.type === 'text' &&
        !['fullName', 'cpf'].includes(field.name)
      ) {
        validator = z.string().min(1, tr('required'));
      } else if (field.type === 'date') {
        // Date validators skip empty strings by design (to allow optional dates).
        // For required dates, gate with a non-empty check first, then run the
        // date-specific logic (age range, min/max) so error messages are correct.
        const innerValidator = validator;
        validator = z.string()
          .min(1, tr('required'))
          .superRefine((val, ctx) => {
            const parsed = innerValidator.safeParse(val);
            if (!parsed.success) {
              for (const issue of parsed.error.issues) {
                ctx.addIssue({ ...issue } as Parameters<typeof ctx.addIssue>[0]);
              }
            }
          });
      } else if (field.type === 'multiselect') {
        validator = z.array(z.string()).min(1, tr('required'));
      }
    } else if (!isRequired || hasConditionalVisibility) {
      // Optional or conditionally visible: allow empty
      if (field.type === 'checkbox') {
        validator = z.boolean().optional();
      } else if (field.type === 'multiselect') {
        validator = z.array(z.string()).optional();
      } else if (field.type === 'number') {
        // Use the field-specific validator if it already handles optional (heightCm, weightKg)
        // Otherwise fall back to generic coerce
        if (['heightCm', 'weightKg'].includes(field.name)) {
          // Already built with preprocess + .optional() by buildFieldValidator
        } else {
          validator = z.union([z.coerce.number(), z.literal('')]).optional();
        }
      } else {
        validator = validator.optional().or(z.literal(''));
      }
    }

    // Latin-script enforcement for member personal data (no Cyrillic).
    // Applied last so it survives the required/optional rebuilds above, and
    // wraps whatever validator type resulted. Empty values pass here — the
    // required check (if any) already ran.
    if (LATIN_NAME_FIELDS.has(field.name)) {
      validator = validator.refine(
        (v) => isLatinName(typeof v === 'string' ? v : null),
        { message: tr('name_latin') },
      );
    } else if (LATIN_TEXT_FIELDS.has(field.name)) {
      validator = validator.refine(
        (v) => isLatinText(typeof v === 'string' ? v : null),
        { message: tr('text_latin') },
      );
    }

    shape[field.name] = validator;
  }

  // Account fields (not in FormConfig)
  // Build a locale-aware password schema using the translator so errors
  // appear in the user's language. Also gate with a Latin-only check so
  // Cyrillic input shows a clear message instead of confusing char-class errors.
  shape.password = z
    .string()
    .refine((val) => !/[^\x00-\x7F]/.test(val), { message: tr('password_latin') })
    .min(8, tr('password_length'))
    .refine((val) => /[A-Z]/.test(val), { message: tr('password_uppercase') })
    .refine((val) => /[a-z]/.test(val), { message: tr('password_lowercase') })
    .refine((val) => /[0-9]/.test(val), { message: tr('password_digit') });
  shape.confirmPassword = z.string().min(1, tr('required'));

  // GDPR consent fields — built from the active gdprFields set (defaults to the
  // standard accept-terms/accept-privacy/age-confirmation/marketing-consent set).
  for (const field of gdprFields) {
    shape[field.name] = field.required
      ? z.literal(true, { message: tr(GDPR_MESSAGE_KEYS[field.name] ?? 'required') })
      : z.boolean().optional();
  }

  const hasMinorGuardianField = fields.some((f) => f.name === 'isMinorGuardian');

  return z
    .object(shape)
    .refine((data) => data.password === data.confirmPassword, {
      message: tr('passwords_mismatch'),
      path: ['confirmPassword'],
    })
    .refine(
      (data) => {
        if (data.email && data.password) {
          const username = (data.email as string).split('@')[0].toLowerCase();
          return !(data.password as string).toLowerCase().includes(username);
        }
        return true;
      },
      { message: tr('password_email'), path: ['password'] },
    )
    .superRefine((data, ctx) => {
      // Minor/guardian gate — only applies to configs that actually have the
      // checkbox (Alliance Member). Unchecked: enforce a 16-year minimum age.
      // Checked: age restriction is lifted, but parent name + phone become required.
      if (!hasMinorGuardianField) return;
      const dobStr = data.dateOfBirth as string | undefined;
      if (!dobStr) return;
      const age = calculateAge(dobStr);
      if (age === null) return;

      const isGuardian = data.isMinorGuardian === true;
      if (!isGuardian && age < 16) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: tr('minAge'), path: ['dateOfBirth'] });
      }
      if (isGuardian) {
        if (!data.parentFullName || String(data.parentFullName).trim() === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: tr('required'), path: ['parentFullName'] });
        }
        if (!data.parentPhone || String(data.parentPhone).trim() === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: tr('required'), path: ['parentPhone'] });
        }
      }
    });
}

// Calculate password strength (0-4)
export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  return strength;
}
