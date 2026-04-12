import { signOutAction } from "@/app/actions";

export function SignOutForm() {
  return (
    <form action={signOutAction}>
      <button className="nav-secondary" type="submit">
        Sign out
      </button>
    </form>
  );
}
