/**
 * Latin-script enforcement for member personal data.
 *
 * Policy: all member-entered personal data (names, addresses, identity fields)
 * must be in the Latin script. Accented Latin letters are allowed (José,
 * Müller, João, Łukasz) because the membership base is global, but non-Latin
 * scripts — Cyrillic above all — are rejected at input time.
 *
 * "Latin" here means Unicode `Script=Latin` plus combining marks (`\p{M}`,
 * which covers decomposed accents like "e" + U+0301). Precomposed accents
 * (single code points such as U+00E9 "é") are themselves `Script=Latin`.
 */

// Apostrophe + hyphen variants people actually paste (straight, curly, dashes).
const NAME_PUNCT = "\\s'’.\\-‐–";
// Free-text fields (addresses, IDs) additionally allow digits and address punctuation.
const TEXT_PUNCT = "\\s'’.,\\-‐–/#&()º°ª:;";

// A name must start with a Latin letter, then Latin letters / marks / separators.
const NAME_RE = new RegExp(
  `^[\\p{Script=Latin}\\p{M}][\\p{Script=Latin}\\p{M}${NAME_PUNCT}]*$`,
  'u',
);

// Free text: Latin letters, marks, decimal digits, and address punctuation.
const TEXT_RE = new RegExp(
  `^[\\p{Script=Latin}\\p{M}\\p{Nd}${TEXT_PUNCT}]*$`,
  'u',
);

/** True if the value is a valid Latin-script personal name (or empty). */
export function isLatinName(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return true; // emptiness is the schema's concern
  return NAME_RE.test(value.trim());
}

/** True if the value is valid Latin-script free text — names, addresses, IDs (or empty). */
export function isLatinText(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return true;
  return TEXT_RE.test(value.trim());
}
