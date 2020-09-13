import React from "react";
import csrfToken from "util/csrf-token";
import useServerSync, { SyncStatus } from "util/hooks/use-server-sync";

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

  switch (syncStatus) {
    case SyncStatus.SYNCED:
      return <span className="badge badge-success">All changes saved</span>;
    case SyncStatus.SYNCING:
      return <span className="badge badge-primary">Saving...</span>;
    case SyncStatus.ERROR:
      return <span className="badge badge-danger">Failed to save changes</span>;
  }
}
