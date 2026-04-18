import { TaskResetPassword } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isClerkConfigured } from "@/lib/platform";

export default function SignInResetPasswordPage() {
  if (!isClerkConfigured) {
    redirect("/forgot-password");
  }

  return (
    <div className="page auth-hosted-shell">
      <section className="auth-hosted-card">
        <TaskResetPassword redirectUrlComplete="/" />
        <p className="auth-hosted-card__support">
          After you save your new password, you&apos;ll head back into your
          account automatically.
        </p>
      </section>
    </div>
  );
}
