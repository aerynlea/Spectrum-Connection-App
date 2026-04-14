import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";

import { isClerkConfigured } from "@/lib/platform";

export default function SignInPage() {
  if (!isClerkConfigured) {
    redirect("/auth");
  }

  const signInProps = {
    fallbackRedirectUrl: "/dashboard",
    path: "/sign-in",
    resetPasswordUrl: "/sign-in/reset-password",
    routing: "path",
    signUpFallbackRedirectUrl: "/onboarding",
    signUpUrl: "/sign-up",
  } as unknown as ComponentProps<typeof SignIn>;

  return (
    <div className="page auth-hosted-shell">
      <section className="auth-hosted-card">
        <SignIn {...signInProps} />
        <p className="auth-hosted-card__support">
          If your password isn&apos;t working, choose{" "}
          <strong>Forgot password?</strong> in the sign-in form to reset it.
        </p>
      </section>
    </div>
  );
}
