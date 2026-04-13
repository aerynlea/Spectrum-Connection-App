import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isClerkConfigured } from "@/lib/platform";

export default function SignInPage() {
  if (!isClerkConfigured) {
    redirect("/auth");
  }

  return (
    <div className="page auth-hosted-shell">
      <section className="auth-hosted-card">
        <SignIn
          fallbackRedirectUrl="/dashboard"
          path="/sign-in"
          routing="path"
          signUpFallbackRedirectUrl="/onboarding"
          signUpUrl="/sign-up"
        />
      </section>
    </div>
  );
}
