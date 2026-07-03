import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { UseFormReturn } from 'react-hook-form';

interface UseFormNavigationParams {
  form: UseFormReturn<Record<string, unknown>>;
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  completedSteps: Set<number>;
  setCompletedSteps: Dispatch<SetStateAction<Set<number>>>;
  activeSections: readonly string[];
  currentSection: string;
  prefersReduced: boolean | null;
  setSlideDirection: Dispatch<SetStateAction<'left' | 'right'>>;
  setAnimating: Dispatch<SetStateAction<boolean>>;
  setAdvancing: Dispatch<SetStateAction<boolean>>;
  getCurrentFieldNames: () => string[];
  checkEmailUniqueness: () => Promise<void>;
  /** Validates required file fields for the current step; returns names of any still missing. */
  validateRequiredFiles: () => string[];
  /**
   * Validates the minor/guardian age gate. Zod's object-level `superRefine`
   * (used for this cross-field check) isn't evaluated by react-hook-form's
   * `trigger(names)` when given a subset of field names — only a full,
   * no-args `trigger()` runs it — so it's checked manually here instead,
   * the same way `validateRequiredFiles` works around file fields being
   * excluded from the zod schema entirely.
   */
  validateMinorGuardian: () => boolean;
}

export function useFormNavigation({
  form,
  currentStep,
  setCurrentStep,
  completedSteps,
  setCompletedSteps,
  activeSections,
  currentSection,
  prefersReduced,
  setSlideDirection,
  setAnimating,
  setAdvancing,
  getCurrentFieldNames,
  checkEmailUniqueness,
  validateRequiredFiles,
  validateMinorGuardian,
}: UseFormNavigationParams) {
  // Animate step transition with slide direction
  const transitionToStep = useCallback((nextStep: number, direction: 'left' | 'right') => {
    setSlideDirection(direction);
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' });
      setTimeout(() => setAnimating(false), 50);
    }, 150);
  }, [prefersReduced, setSlideDirection, setAnimating, setCurrentStep]);

  // Navigate to next section
  const handleNext = useCallback(async () => {
    setAdvancing(true);
    const fieldNames = getCurrentFieldNames();
    const isValid = await form.trigger(fieldNames);
    const invalidFileFields = validateRequiredFiles();
    const minorGuardianValid = validateMinorGuardian();
    const allFieldNames = [...fieldNames, ...invalidFileFields, 'parentFullName', 'parentPhone'];

    // Check email uniqueness when leaving the section that contains the email field
    // (personal for new-layout configs, contact for legacy configs)
    if (currentSection === 'personal' || currentSection === 'contact') {
      await checkEmailUniqueness();
      if (form.formState.errors.email) {
        setAdvancing(false);
        return;
      }
    }

    if (isValid && invalidFileFields.length === 0 && minorGuardianValid) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      transitionToStep(Math.min(currentStep + 1, activeSections.length - 1), 'left');
    } else {
      // Give React a tick to flush error state into the DOM, then scroll to the first invalid field
      setTimeout(() => {
        const firstError = allFieldNames.find((name) => !!form.getFieldState(name).error);
        if (firstError) {
          const el = document.getElementById(`field-${firstError}`);
          if (el) {
            el.scrollIntoView({ behavior: prefersReduced ? 'instant' : 'smooth', block: 'center' });
            const input = el.querySelector<HTMLElement>('input, select, textarea, button[role="checkbox"], button[role="combobox"]');
            if (input) input.focus({ preventScroll: true });
          }
        }
      }, 50);
    }
    setAdvancing(false);
  }, [
    form,
    currentSection,
    currentStep,
    activeSections,
    prefersReduced,
    setAdvancing,
    setCompletedSteps,
    transitionToStep,
    getCurrentFieldNames,
    checkEmailUniqueness,
    validateRequiredFiles,
    validateMinorGuardian,
  ]);

  const handlePrevious = useCallback(() => {
    transitionToStep(Math.max(currentStep - 1, 0), 'right');
  }, [currentStep, transitionToStep]);

  const handleStepClick = useCallback((step: number) => {
    if (step <= currentStep || completedSteps.has(step)) {
      transitionToStep(step, step < currentStep ? 'right' : 'left');
    }
  }, [currentStep, completedSteps, transitionToStep]);

  return { transitionToStep, handleNext, handlePrevious, handleStepClick };
}
