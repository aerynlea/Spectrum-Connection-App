import { toggleSavedResourceAction } from "@/app/actions";

type SaveResourceFormProps = {
  isSaved: boolean;
  resourceId: string;
  returnTo: string;
};

export function SaveResourceForm({
  isSaved,
  resourceId,
  returnTo,
}: SaveResourceFormProps) {
  return (
    <form action={toggleSavedResourceAction}>
      <input name="resourceId" type="hidden" value={resourceId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <button
        className={isSaved ? "save-button save-button--active" : "save-button"}
        type="submit"
      >
        {isSaved ? "Saved" : "Save resource"}
      </button>
    </form>
  );
}
