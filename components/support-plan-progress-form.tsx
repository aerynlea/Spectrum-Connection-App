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

type SupportPlanProgressFormProps = {
  currentStatus: SupportStepStatus;
  stepId: string;
  suggestedStatus: SupportStepStatus;
};

export function SupportPlanProgressForm({
  currentStatus,
  stepId,
  suggestedStatus,
}: SupportPlanProgressFormProps) {
  const [state, formAction] = useActionState(
    updateSupportPlanStepStatusAction,
    initialState,
  );
  const effectiveStatus = state.currentStatus ?? currentStatus;

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
