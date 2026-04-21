"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfileAction, type ProfileActionState } from "@/app/actions";
import { GoalCheckboxes } from "@/components/goal-checkboxes";
import { NewsletterOptInField } from "@/components/newsletter-opt-in-field";
import { ageGroupOptions, roleOptions } from "@/lib/catalog";
import type { AppUser } from "@/lib/app-types";

const initialState: ProfileActionState = {
  status: "idle",
  message: null,
};

function SaveProfileButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button-primary" type="submit">
      {pending ? "Saving profile..." : "Save profile"}
    </button>
  );
}

type ProfileFormProps = {
  currentUser: AppUser;
};

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="form-card">
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
        <span>Priority goals</span>
        <p className="field-help">
          These goals help us highlight the resources and events that may be most
          helpful right now.
        </p>
        <GoalCheckboxes selected={currentUser.goals} />
      </div>

      <NewsletterOptInField
        defaultChecked={currentUser.newsletterSubscribed}
      />

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "inline-status inline-status--error"
              : "inline-status"
          }
        >
          {state.message}
        </p>
      ) : null}

      <SaveProfileButton />
    </form>
  );
}
