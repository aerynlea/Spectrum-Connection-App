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
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </section>
    </div>
  );
}
