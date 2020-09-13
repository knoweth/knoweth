import React, { useCallback, useEffect, useState } from "react";
import asyncSleep from "util/async-sleep";
import asyncThrottle from "util/async-throttle";
import csrfToken from "util/csrf-token";

export default function DocumentSaver({ state }: { state: any }) {
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">(
    "synced"
  );

  const updateState = useCallback(
    asyncThrottle(
      async ({
        newState,
        abortController,
      }: {
        newState: any;
        abortController: AbortController;
      }) => {
        setSyncStatus("syncing");
        function onBeforeUnload(e: BeforeUnloadEvent) {
          // Cancel the event
          // If you prevent default behavior in Mozilla Firefox prompt will
          // always be shown
          e.preventDefault();
          // Chrome requires returnValue to be set
          e.returnValue = "";
        }
        window.addEventListener("beforeunload", onBeforeUnload);

        try {
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
          setSyncStatus("synced");
        } catch (e) {
          if (abortController.signal.aborted) {
            // we aborted, do nothing
            return;
          }
          setSyncStatus("error");
        } finally {
          window.removeEventListener("beforeunload", onBeforeUnload);
        }

        // Minimum 1 s between runs
        await asyncSleep(1000);
      }
    ),
    []
  );

  useEffect(() => {
    console.log("Updating state:", state);
    const abortController = new AbortController();
    updateState({ newState: state, abortController });
    return () => abortController.abort();
  }, [updateState, state]);

  switch (syncStatus) {
    case "synced":
      return <span className="badge badge-success">All changes saved</span>;
    case "syncing":
      return <span className="badge badge-primary">Saving...</span>;
    case "error":
      return <span className="badge badge-danger">Failed to save changes</span>;
  }
}
