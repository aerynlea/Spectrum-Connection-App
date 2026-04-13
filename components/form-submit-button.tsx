"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
};

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  className = "button-primary",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit">
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
