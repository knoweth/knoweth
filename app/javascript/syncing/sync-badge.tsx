import React from "react";
import { SyncStatus } from "./use-server-sync";

export default function SyncBadge({ status }: { status: SyncStatus }) {
  switch (status) {
    case SyncStatus.SYNCED:
      return (
        <span className="bg-green-600 text-white btn">All changes saved</span>
      );
    case SyncStatus.SYNCING:
      return <span className="bg-yellow-600 text-white btn">Saving...</span>;
    case SyncStatus.ERROR:
      return (
        <span className="bg-red-600 text-white btn">
          Failed to save changes
        </span>
      );
  }
}
