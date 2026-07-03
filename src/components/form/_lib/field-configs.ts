import type { FormFieldConfig } from '@/lib/types/form-config';

// Virtual field definitions for account fields (not in FormConfig)
export const PASSWORD_FIELD: FormFieldConfig = {
  section: 'credentials',
  name: 'password',
  type: 'text',
  required: true,
  label: 'Password',
};

export const CONFIRM_PASSWORD_FIELD: FormFieldConfig = {
  section: 'credentials',
  name: 'confirmPassword',
  type: 'text',
  required: true,
  label: 'Confirm Password',
};

export const GDPR_FIELDS: FormFieldConfig[] = [
  {
    section: 'credentials',
    name: 'acceptTerms',
    type: 'checkbox',
    required: true,
    label: 'I have read and agree to the Terms of Service',
  },
  {
    section: 'credentials',
    name: 'acceptPrivacy',
    type: 'checkbox',
    required: true,
    label: 'I have read and agree to the Privacy Policy',
  },
  {
    section: 'credentials',
    name: 'ageConfirmation',
    type: 'checkbox',
    required: true,
    label: 'I am 16 years of age or older',
  },
  {
    section: 'credentials',
    name: 'marketingConsent',
    type: 'checkbox',
    required: false,
    label: 'I consent to receiving membership updates and news by email',
  },
];

export const DATA_ACCURACY_FIELD: FormFieldConfig = {
  section: 'credentials',
  name: 'dataAccuracyDeclaration',
  type: 'checkbox',
  required: true,
  label: 'I declare that the information I provided is accurate',
};

// register-2 variant: replaces the separate Terms/Privacy checkboxes with a
// single data-accuracy declaration. Age confirmation and marketing consent
// are unchanged.
export const GDPR_FIELDS_V2: FormFieldConfig[] = [
  DATA_ACCURACY_FIELD,
  {
    section: 'credentials',
    name: 'ageConfirmation',
    type: 'checkbox',
    required: true,
    label: 'I am 16 years of age or older',
  },
  {
    section: 'credentials',
    name: 'marketingConsent',
    type: 'checkbox',
    required: false,
    label: 'I consent to receiving membership updates and news by email',
  },
];

// Fields hidden from every registration form. Hidden fields are neither
// rendered nor validated (see isFieldVisible + buildRegistrationSchema), so a
// field listed here is effectively removed regardless of the CMS form config.
//   - termsAccepted: handled by the GDPR section
//   - trainingStart / teacherName: not collected at registration
export const HIDDEN_FIELDS = new Set(['termsAccepted', 'trainingStart', 'teacherName']);

export const DATA_SOURCE_URL: Record<string, string> = {
  leaders: '/api/v1/public/leaders',
  dojos: '/api/v1/public/dojos/dropdown',
};

export const DATA_SOURCE_KEY: Record<string, string> = {
  leaders: 'leaders',
  dojos: 'dojos',
};
