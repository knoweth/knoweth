import React from "react";
import { SyncStatus } from "./use-server-sync";

export default function SyncBadge({ status }: { status: SyncStatus }) {
  switch (status) {
    case SyncStatus.SYNCED:
      return <span className="badge badge-success">All changes saved</span>;
    case SyncStatus.SYNCING:
      return <span className="badge badge-primary">Saving...</span>;
    case SyncStatus.ERROR:
      return <span className="badge badge-danger">Failed to save changes</span>;
  }
}
