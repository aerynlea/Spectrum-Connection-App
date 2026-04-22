"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateSupportPlanStepStatusAction,
  type SupportPlanStepActionState,
} from "@/app/actions";
import type { SupportStepStatus } from "@/lib/app-types";
import { formatSupportStepStatus } from "@/lib/formatters";

const initialState: SupportPlanStepActionState = {
  status: "idle",
  message: null,
  currentFollowUpAt: null,
  currentNote: "",
  currentStatus: null,
};

const statusOptions: SupportStepStatus[] = [
  "saved",
  "contacted",
  "attended",
  "done",
];

function StatusButton(props: {
  active: boolean;
  suggested: boolean;
  value: SupportStepStatus;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={[
        "support-step-status-button",
        props.active ? "support-step-status-button--active" : "",
        !props.active && props.suggested
          ? "support-step-status-button--suggested"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={pending}
      name="status"
      type="submit"
      value={props.value}
    >
      {pending && props.active
        ? "Saving..."
        : formatSupportStepStatus(props.value)}
    </button>
  );
}

function SaveDetailsButton(props: { status: SupportStepStatus }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="button-secondary support-step-details-button"
      disabled={pending}
      name="status"
      type="submit"
      value={props.status}
    >
      {pending ? "Saving details..." : "Save note and follow-up"}
    </button>
  );
}

type SupportPlanProgressFormProps = {
  currentFollowUpAt: string | null;
  currentNote: string;
  currentStatus: SupportStepStatus;
  stepId: string;
  suggestedStatus: SupportStepStatus;
};

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function SupportPlanProgressForm({
  currentFollowUpAt,
  currentNote,
  currentStatus,
  stepId,
  suggestedStatus,
}: SupportPlanProgressFormProps) {
  const [state, formAction] = useActionState(
    updateSupportPlanStepStatusAction,
    initialState,
  );
  const hasFreshServerState = state.status === "success";
  const effectiveStatus = hasFreshServerState
    ? (state.currentStatus ?? currentStatus)
    : currentStatus;
  const effectiveNote = hasFreshServerState ? state.currentNote : currentNote;
  const effectiveFollowUpAt = hasFreshServerState
    ? state.currentFollowUpAt
    : currentFollowUpAt;

  return (
    <form action={formAction} className="support-step-status-form">
      <input name="stepId" type="hidden" value={stepId} />
      <div className="support-step-status-row">
        {statusOptions.map((status) => (
          <StatusButton
            active={effectiveStatus === status}
            key={status}
            suggested={suggestedStatus === status}
            value={status}
          />
        ))}
      </div>
      <div className="field-grid support-step-status-grid">
        <label className="field">
          <span>What happened?</span>
          <textarea
            key={`note-${stepId}-${effectiveNote}`}
            defaultValue={effectiveNote}
            name="note"
            placeholder="Add a quick note like who you spoke with, what they said, or what felt helpful."
          />
        </label>
        <label className="field">
          <span>Follow up by</span>
          <input
            key={`followup-${stepId}-${effectiveFollowUpAt ?? ""}`}
            defaultValue={toDateInputValue(effectiveFollowUpAt)}
            name="followUpAt"
            type="date"
          />
        </label>
      </div>
      <div className="support-step-details-row">
        <SaveDetailsButton status={effectiveStatus} />
      </div>
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
    </form>
  );
}
