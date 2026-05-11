"use client";

import { useState, useTransition } from "react";
import {
  cancelAccountDeletion,
  requestAccountDeletion,
  requestDataExport,
} from "@/lib/onboarding/actions";
import { COPY } from "@/lib/onboarding/copy";
import { track } from "@/lib/analytics";

type Props = {
  scheduledDeletionAt: string | null;
  pendingExportId: string | null;
};

/**
 * The "Privacy & Data" section of /profile/edit. Holds the GDPR/CCPA
 * actions (export + delete) plus a confirm dialog so accidental clicks
 * don't nuke the account.
 */
export function PrivacyDataSection({ scheduledDeletionAt, pendingExportId }: Props) {
  const [pending, startTransition] = useTransition();
  const [exportPending, setExportPending] = useState(Boolean(pendingExportId));
  const [scheduled, setScheduled] = useState(scheduledDeletionAt);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  function exportNow() {
    startTransition(async () => {
      const res = await requestDataExport();
      if (res.ok) { track.dataExportRequested(); setExportPending(true); }
    });
  }

  function scheduleDeletion() {
    startTransition(async () => {
      const res = await requestAccountDeletion(reason || undefined);
      if (res.ok) {
        setScheduled(res.data?.scheduledFor ?? null);
        setConfirmOpen(false);
      }
    });
  }

  function cancelDeletion() {
    startTransition(async () => {
      const res = await cancelAccountDeletion();
      if (res.ok) setScheduled(null);
    });
  }

  return (
    <section className="of-profile-section" aria-labelledby="of-data-h">
      <h2 id="of-data-h" className="of-profile-h">{COPY.privacy.sectionTitle}</h2>
      <p className="of-helper of-helper--block">{COPY.privacy.sectionSubtitle}</p>

      {/* Export */}
      <div className="of-data-card">
        <strong className="of-data-card__title">{COPY.privacy.exportTitle}</strong>
        <p className="of-helper">{COPY.privacy.exportBody}</p>
        {exportPending ? (
          <p className="of-data-card__status" role="status">
            {COPY.privacy.exportPending}
          </p>
        ) : (
          <button
            type="button"
            className="of-btn of-btn--ghost of-btn--sm"
            onClick={exportNow}
            disabled={pending}
          >
            {COPY.privacy.exportCta}
          </button>
        )}
      </div>

      {/* Delete */}
      <div className="of-data-card of-data-card--danger">
        <strong className="of-data-card__title">{COPY.privacy.deleteTitle}</strong>
        <p className="of-helper">{COPY.privacy.deleteBody}</p>
        {scheduled ? (
          <>
            <p className="of-data-card__status" role="status">
              {COPY.privacy.deleteScheduled(new Date(scheduled).toLocaleDateString())}
            </p>
            <button
              type="button"
              className="of-btn of-btn--ghost of-btn--sm"
              onClick={cancelDeletion}
              disabled={pending}
            >
              Cancel deletion
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="of-btn of-btn--danger of-btn--sm"
              onClick={() => setConfirmOpen(true)}
              disabled={pending}
            >
              {COPY.privacy.deleteCta}
            </button>
            {confirmOpen && (
              <div className="of-confirm" role="dialog" aria-modal="true" aria-label="Confirm deletion">
                <p className="of-helper">
                  This will schedule deletion in 30 days. Tell us why if you'd like (optional):
                </p>
                <textarea
                  className="of-input"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What didn't work for you?"
                />
                <div className="of-confirm__actions">
                  <button
                    type="button"
                    className="of-btn of-btn--ghost of-btn--sm"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Never mind
                  </button>
                  <button
                    type="button"
                    className="of-btn of-btn--danger of-btn--sm"
                    onClick={scheduleDeletion}
                    disabled={pending}
                    aria-busy={pending}
                  >
                    Yes, schedule deletion
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
