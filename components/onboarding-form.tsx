import { completeOnboardingAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { GoalCheckboxes } from "@/components/goal-checkboxes";
import { NewsletterOptInField } from "@/components/newsletter-opt-in-field";
import { ageGroupOptions, roleOptions } from "@/lib/catalog";
import type { AppUser } from "@/lib/app-types";

type OnboardingFormProps = {
  currentUser: AppUser;
};

export function OnboardingForm({ currentUser }: OnboardingFormProps) {
  return (
    <form action={completeOnboardingAction} className="form-card">
      <div className="field-grid">
        <label className="field">
          <span>Name</span>
          <input defaultValue={currentUser.name} name="name" required type="text" />
        </label>
        <label className="field">
          <span>Location</span>
          <input
            defaultValue={currentUser.location}
            name="location"
            placeholder="City, state, or region"
            required
            type="text"
          />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Your role</span>
          <select defaultValue={currentUser.role} name="role" required>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Current age focus</span>
          <select defaultValue={currentUser.ageGroup} name="ageGroup" required>
            {ageGroupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field">
        <span>What would help most right now?</span>
        <p className="field-help">
          Choose the areas you want Guiding Light to bring forward first.
        </p>
        <GoalCheckboxes selected={currentUser.goals} />
      </div>

      <NewsletterOptInField
        defaultChecked={currentUser.newsletterSubscribed}
      />

      <FormSubmitButton
        idleLabel="Finish onboarding"
        pendingLabel="Saving your space..."
      />
    </form>
  );
}
