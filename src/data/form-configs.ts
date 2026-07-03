import type { FormFieldConfig } from '@/lib/types/form-config';

// Hardcoded replacement for the Payload CMS "form-configs" collection — this
// app has no CMS, so the field definitions live here instead. Field lists
// mirror the `alliance_member/register2` and `dojo_operator/register2`
// configs from the main kwu-senshi platform.
//
// Fields that are always hidden (trainingStart, teacherName) or always
// removed (photo, heightCm, weightKg) by the shared form-config utilities are
// intentionally omitted — they'd never render or validate anyway.

const CURRENT_RANK_OPTIONS = [
  '10KYU', '9KYU', '8KYU', '7KYU', '6KYU', '5KYU', '4KYU', '3KYU', '2KYU', '1KYU',
  '1DAN', '2DAN', '3DAN', '4DAN', '5DAN', '6DAN', '7DAN', '8DAN', '9DAN',
];

export const ALLIANCE_MEMBER_FIELDS: FormFieldConfig[] = [
  // Personal
  { section: 'personal', name: 'fullName', type: 'text', required: true, label: 'Full Name' },
  { section: 'personal', name: 'email', type: 'email', required: true, label: 'Email Address' },
  { section: 'personal', name: 'sex', type: 'select', required: true, label: 'Gender', options: ['MASCULINE', 'FEMININE', 'OTHER'] },
  { section: 'personal', name: 'dateOfBirth', type: 'date', required: true, label: 'Date of Birth' },
  { section: 'personal', name: 'countryOfOrigin', type: 'text', required: true, label: 'Country of Origin' },

  // Contact — telephone first (register-2 requirement)
  { section: 'contact', name: 'telephone', type: 'tel', required: true, label: 'Telephone' },
  { section: 'contact', name: 'country', type: 'text', required: true, label: 'Country' },
  { section: 'contact', name: 'city', type: 'text', required: true, label: 'City' },
  { section: 'contact', name: 'addressLine1', type: 'text', required: true, label: 'Address' },
  { section: 'contact', name: 'stateProvince', type: 'text', required: false, label: 'State / Province' },
  { section: 'contact', name: 'zipCode', type: 'text', required: false, label: 'Zip / Postal Code' },

  // Identity (renders within the credentials step)
  { section: 'identity', name: 'governmentId', type: 'text', required: false, label: 'Government ID / Passport Number' },
  { section: 'identity', name: 'cpf', type: 'text', required: false, label: 'CPF (Brazil only)', visibleWhen: { country: 'BR' } },
  { section: 'identity', name: 'fatherName', type: 'text', required: false, label: "Father's Name" },
  { section: 'identity', name: 'motherName', type: 'text', required: false, label: "Mother's Name" },
  { section: 'identity', name: 'medicalInsurance', type: 'text', required: false, label: 'Medical Insurance Provider' },

  // Martial Arts Background
  { section: 'martialArts', name: 'currentRank', type: 'select', required: true, label: 'Current Rank', options: CURRENT_RANK_OPTIONS },
  { section: 'martialArts', name: 'dojoId', type: 'select', required: true, label: 'Dojo / Club', dataSource: 'dojos' },
  { section: 'martialArts', name: 'dojoCity', type: 'text', required: true, label: 'Dojo City' },
  { section: 'martialArts', name: 'dojoCountry', type: 'text', required: true, label: 'Dojo Country' },

  // Credentials — document uploads
  { section: 'credentials', name: 'rankCertificate', type: 'file', required: false, label: 'Rank Certificate (scan/photo)' },
  { section: 'credentials', name: 'governmentIdDoc', type: 'file', required: false, label: 'Government ID (scan/photo)' },
  { section: 'credentials', name: 'insuranceDoc', type: 'file', required: false, label: 'Insurance Document' },
];

export const DOJO_OPERATOR_FIELDS: FormFieldConfig[] = [
  // Personal
  { section: 'personal', name: 'fullName', type: 'text', required: true, label: 'Full Name' },
  { section: 'personal', name: 'email', type: 'email', required: true, label: 'Email Address' },
  { section: 'personal', name: 'sex', type: 'select', required: true, label: 'Gender', options: ['MASCULINE', 'FEMININE', 'OTHER'] },
  { section: 'personal', name: 'dateOfBirth', type: 'date', required: true, label: 'Date of Birth' },
  { section: 'personal', name: 'countryOfOrigin', type: 'text', required: true, label: 'Country of Origin' },

  // Contact — telephone first (register-2 requirement)
  { section: 'contact', name: 'telephone', type: 'tel', required: true, label: 'Telephone' },
  { section: 'contact', name: 'country', type: 'text', required: true, label: 'Country' },
  { section: 'contact', name: 'city', type: 'text', required: true, label: 'City' },
  { section: 'contact', name: 'addressLine1', type: 'text', required: true, label: 'Address' },
  { section: 'contact', name: 'stateProvince', type: 'text', required: false, label: 'State / Province' },
  { section: 'contact', name: 'zipCode', type: 'text', required: false, label: 'Zip / Postal Code' },

  // Identity (renders within the credentials step)
  { section: 'identity', name: 'governmentId', type: 'text', required: false, label: 'Government ID / Passport Number' },
  { section: 'identity', name: 'cpf', type: 'text', required: false, label: 'CPF (Brazil only)', visibleWhen: { country: 'BR' } },
  { section: 'identity', name: 'fatherName', type: 'text', required: false, label: "Father's Name" },
  { section: 'identity', name: 'motherName', type: 'text', required: false, label: "Mother's Name" },
  { section: 'identity', name: 'medicalInsurance', type: 'text', required: false, label: 'Medical Insurance Provider' },

  // Dojo Details — the dojo being registered
  { section: 'dojoDetails', name: 'dojoName', type: 'text', required: true, label: 'Dojo Name' },
  { section: 'dojoDetails', name: 'dojoAddress', type: 'text', required: true, label: 'Dojo Address' },
  { section: 'dojoDetails', name: 'dojoCity', type: 'text', required: true, label: 'Dojo City' },
  { section: 'dojoDetails', name: 'dojoCountry', type: 'text', required: true, label: 'Dojo Country' },
  { section: 'dojoDetails', name: 'dojoDescription', type: 'text', required: false, label: 'Dojo Description' },

  // Credentials — document uploads
  { section: 'credentials', name: 'rankCertificate', type: 'file', required: true, label: 'Rank Certificate' },
  { section: 'credentials', name: 'dojoProof', type: 'file', required: true, label: 'Dojo/Gym Proof (lease, registration, or photo)' },
  { section: 'credentials', name: 'governmentIdDoc', type: 'file', required: false, label: 'Government ID (scan/photo)' },
  { section: 'credentials', name: 'insuranceDoc', type: 'file', required: false, label: 'Insurance Document' },
];

// Fixed list of Bulgarian dojos for the Alliance Member "which club do you
// belong to" dropdown — not backed by a live API/DB, see the AM page for the
// "not a dojo member" sentinel option appended at render time.
const BG_DOJO_NAMES = [
  'Asenovgrad, SC “Okami Dojo”', 'Aytos, SC “Dragon”', 'Belene, SC “Dunav”',
  'Breznik, SC “Oroshi – Breznik”', 'Burgas, SC “Gladiator”', 'Burgas, SC “Ikigai”',
  'Burgas, SC “Kokoro”', 'Burgas, SC “Sentoki-Burgas”', 'Chirpan, SC “Tsunami”',
  'Dobrich, SC “Nukite”', 'Dobrich, SC “Seiken”', 'Gabrovo, SC “Nadezhda-Gabrovo”',
  'Haskovo, SC “Triumph”', 'Krichim, SC “Shidoshi”', 'Levski, SC “Kyokushin”',
  'Lovech, SC “Senshi-do”', 'Parvomay, SC “Champion”', 'Pernik, SC “Dulo”',
  'Pleven, SC “Kyokushinkai”', 'Plovdiv, SC “Boec”', 'Plovdiv, SC “Ronin”',
  'Ruse, SC “Yunak”', 'Sadovo, SC “Gladiator”', 'Samokov, SC “Satori”',
  'Sevlievo, SC “Voin”', 'Shumen, SC “Kyokushin”', 'Silistra, SC “Dojo”',
  'Sofia, SC “Armeec”', 'Sofia, SC “Fighters NSA”', 'Sofia, SC “Kanku”',
  'Sofia, SC “Shogun”', 'Stara Zagora, Samurai Kyokushinkai Karate Club',
  'Stara Zagora, SC “Asken”', 'Svishtov, SC “Akademik”', 'Tryavna, SC “Hikari”',
  'Varna, SC “Nihonto”', 'Varna, SC “Split”', 'Varna, SC “Zanshin”',
  'Veliko Tarnovo, SC “Katana”', 'Yambol, SC “Doychev 2020”',
];

// Value === label: there's no real Dojo table backing this list, so the
// human-readable name is stored directly on the registration record.
export const DOJO_OPTIONS = BG_DOJO_NAMES.map((label) => ({ value: label, label }));

export const NOT_A_MEMBER_DOJO_ID = 'NOT_A_MEMBER';
