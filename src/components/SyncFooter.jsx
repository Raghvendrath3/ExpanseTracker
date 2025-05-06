import React from "react";
import '../Css/SyncFooter.css';

const SyncFooter = ({ forceSync, isSyncing }) => {
  return (
    <footer className="app-footer">
      <button className="sync-button" onClick={forceSync}>
        {isSyncing ? "Syncing..." : "Sync Data"}
      </button>
    </footer>
  );
};

export default SyncFooter;
