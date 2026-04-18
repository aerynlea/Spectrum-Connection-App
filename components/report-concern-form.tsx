import Link from "next/link";

import { submitModerationReportAction } from "@/app/actions";
import type { ModerationTargetType } from "@/lib/app-types";
import { isClerkConfigured } from "@/lib/platform";
import { reportReasonOptions } from "@/lib/site-data";

type ReportConcernFormProps = {
  canReport: boolean;
  compact?: boolean;
  returnTo: string;
  targetId: string;
  targetType: ModerationTargetType;
};

export function ReportConcernForm({
  canReport,
  compact = false,
  returnTo,
  targetId,
  targetType,
}: ReportConcernFormProps) {
  return (
    <details className={`report-panel${compact ? " report-panel--compact" : ""}`}>
      <summary className="report-panel__summary">Report a concern</summary>
      <div className="report-panel__content">
        <p className="report-panel__support">
          Reports stay private and go to a moderation queue for review.
        </p>

        {canReport ? (
          <form action={submitModerationReportAction} className="form-card">
            <input name="targetType" type="hidden" value={targetType} />
            <input name="targetId" type="hidden" value={targetId} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <label className="field">
              <span>Reason</span>
              <select defaultValue={reportReasonOptions[0]} name="reason" required>
                {reportReasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>What would you like the team to know?</span>
              <textarea
                name="details"
                placeholder="Share a little more context if it would help."
                rows={compact ? 3 : 4}
              />
            </label>
            <button className="button-secondary" type="submit">
              Send private report
            </button>
          </form>
        ) : (
          <p className="field-help">
            Sign in to send a private report.
            {" "}
            <Link
              className="text-link"
              href={isClerkConfigured ? "/sign-in" : "/auth"}
            >
              Open sign in
            </Link>
          </p>
        )}
      </div>
    </details>
  );
}
