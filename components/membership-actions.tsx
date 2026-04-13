import {
  openPremiumBillingPortalAction,
  startPremiumCheckoutAction,
} from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

type MembershipActionsProps = {
  canManage: boolean;
  checkoutDisabled?: boolean;
};

export function MembershipActions({
  canManage,
  checkoutDisabled = false,
}: MembershipActionsProps) {
  return (
    <div className="button-row">
      {canManage ? (
        <form action={openPremiumBillingPortalAction}>
          <FormSubmitButton
            className="button-primary"
            idleLabel="Manage membership"
            pendingLabel="Opening billing..."
          />
        </form>
      ) : (
        <form action={startPremiumCheckoutAction}>
          <button
            className="button-primary"
            disabled={checkoutDisabled}
            type="submit"
          >
            {checkoutDisabled ? "Checkout coming soon" : "Start premium membership"}
          </button>
        </form>
      )}
    </div>
  );
}
