import React from "react";
import csrfToken from "util/csrf-token";
import useServerSync, { SyncStatus } from "syncing/use-server-sync";
import SyncBadge from "syncing/sync-badge";

export default function DocumentSaver({ state }: { state: any }) {
  const syncStatus = useServerSync(
    state,
    async (newState, abortController) => {
      await fetch(location.href, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          document: { content: JSON.stringify(newState) },
        }),
        signal: abortController.signal,
      }).then((res) => {
        if (!res.ok) {
          throw new Error("nak");
        }
      });
    },
    1000
  );

  return <SyncBadge status={syncStatus} />;
}
