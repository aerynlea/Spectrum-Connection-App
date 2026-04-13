import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isClerkConfigured } from "@/lib/platform";

export default function SignUpPage() {
  if (!isClerkConfigured) {
    redirect("/auth");
  }

  return (
    <div className="page auth-hosted-shell">
      <section className="auth-hosted-card">
        <SignUp
          fallbackRedirectUrl="/onboarding"
          path="/sign-up"
          routing="path"
          signInFallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          unsafeMetadata={{
            guidingLight: {
              membershipTier: "free",
              onboardingCompleted: false,
            },
          }}
        />
      </section>
    </div>
  );
}
