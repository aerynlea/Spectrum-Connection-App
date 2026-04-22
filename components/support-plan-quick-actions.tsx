"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateSupportPlanStepStatusAction,
  type SupportPlanStepActionState,
} from "@/app/actions";
import type { SupportStepStatus } from "@/lib/app-types";

const initialState: SupportPlanStepActionState = {
  status: "idle",
  message: null,
  currentFollowUpAt: null,
  currentNote: "",
  currentStatus: null,
};

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function QuickActionButton(props: {
  label: string;
  name: "followUpShortcut" | "status";
  value: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="support-plan-quick-actions__button"
      disabled={pending}
      name={props.name}
      type="submit"
      value={props.value}
    >
      {pending ? "Saving..." : props.label}
    </button>
  );
}

type SupportPlanQuickActionsProps = {
  currentFollowUpAt: string | null;
  currentNote: string;
  currentStatus: SupportStepStatus;
  stepId: string;
};

export function SupportPlanQuickActions({
  currentFollowUpAt,
  currentNote,
  currentStatus,
  stepId,
}: SupportPlanQuickActionsProps) {
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
    <form action={formAction} className="support-plan-quick-actions">
      <input name="currentStatus" type="hidden" value={effectiveStatus} />
      <input name="followUpAt" type="hidden" value={toDateInputValue(effectiveFollowUpAt)} />
      <input name="note" type="hidden" value={effectiveNote} />
      <input name="stepId" type="hidden" value={stepId} />
      <div className="support-plan-quick-actions__buttons">
        <QuickActionButton label="Mark contacted" name="status" value="contacted" />
        <QuickActionButton label="Mark done" name="status" value="done" />
        <QuickActionButton label="In 3 days" name="followUpShortcut" value="3-days" />
        <QuickActionButton label="Next week" name="followUpShortcut" value="next-week" />
      </div>
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "inline-status inline-status--error support-plan-quick-actions__status"
              : "inline-status support-plan-quick-actions__status"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
