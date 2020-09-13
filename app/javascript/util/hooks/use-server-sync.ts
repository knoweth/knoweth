import { useCallback, useEffect, useState } from "react";
import asyncSleep from "util/async-sleep";
import asyncThrottle from "util/async-throttle";

export enum SyncStatus {
  SYNCED,
  SYNCING,
  ERROR,
}

export default function useServerSync<T>(
  state: T,
  update: (newState: T, abortController: AbortController) => Promise<void>,
  intervalMs: number
): SyncStatus {
  const [status, setStatus] = useState(SyncStatus.SYNCED);

  // This is a throttled mmethod to save the state.
  const saveState = useCallback(
    asyncThrottle(
      async ({
        newState,
        abortController,
      }: {
        newState: T;
        abortController: AbortController;
      }) => {
        setStatus(SyncStatus.SYNCING);

        try {
          await update(newState, abortController);
          setStatus(SyncStatus.SYNCED);
        } catch (e) {
          if (abortController.signal.aborted) {
            // We aborted, abandon ship
            return;
          }
          console.error(e);
          setStatus(SyncStatus.ERROR);
        } finally {
          // Minimum 1 s between runs
          await asyncSleep(intervalMs);
        }
      }
    ),
    []
  );

  // This function actually triggers the syncing.
  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      window.addEventListener("beforeunload", onBeforeUnload);
      function onBeforeUnload(e: BeforeUnloadEvent) {
        // Cancel the event
        // If you prevent default behavior in Mozilla Firefox prompt will
        // always be shown
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "";
      }
      await saveState({ newState: state, abortController });
      window.removeEventListener("beforeunload", onBeforeUnload);
    })();
    return () => abortController.abort();
  }, [saveState, state]);

  // Return the current status of the sync job.
  return status;
}
