"use client";

import { useOptimistic, useState, useTransition, type FormEvent } from "react";

import { unstable_rethrow, usePathname, useRouter } from "next/navigation";

import {
  toggleSavedResourceAction,
  type ToggleSavedResourceActionState,
} from "@/app/actions";

type SaveResourceFormProps = {
  isSaved: boolean;
  resourceId: string;
  returnTo: string;
};

const defaultErrorState: Pick<ToggleSavedResourceActionState, "message" | "status"> = {
  message: null,
  status: "success",
};

export function SaveResourceForm({
  isSaved,
  resourceId,
  returnTo,
}: SaveResourceFormProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmedIsSaved, setConfirmedIsSaved] = useState(isSaved);
  const [feedback, setFeedback] = useState(defaultErrorState);
  const [optimisticIsSaved, addOptimisticIsSaved] = useOptimistic(
    confirmedIsSaved,
    (_currentState, nextState: boolean) => nextState,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSavedState = !confirmedIsSaved;
    setFeedback(defaultErrorState);

    startTransition(async () => {
      addOptimisticIsSaved(nextSavedState);

      try {
        const result = await toggleSavedResourceAction({
          resourceId,
          returnTo,
        });

        if (result.status === "error") {
          setFeedback({
            message: result.message,
            status: "error",
          });
          return;
        }

        setConfirmedIsSaved(result.isSaved);

        if (result.refreshCurrentPage && pathname === "/dashboard") {
          router.refresh();
        }
      } catch (error) {
        unstable_rethrow(error);
        setFeedback({
          message: "We could not update that save just now.",
          status: "error",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        aria-busy={isPending}
        className={
          optimisticIsSaved
            ? "save-button save-button--active"
            : "save-button"
        }
        disabled={isPending}
        type="submit"
      >
        {optimisticIsSaved ? "Saved" : "Save resource"}
      </button>
      {feedback.message ? (
        <p className="inline-status inline-status--error">{feedback.message}</p>
      ) : null}
    </form>
  );
}
