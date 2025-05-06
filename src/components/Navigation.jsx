import React from "react";
import '../css/Navigation.css'

const Navigation = ({ navigateHome, syncStatus, isSyncing }) => {
  return (
    <nav className="app-navigation">
      <button className="home-button" onClick={navigateHome}>
        <span className="home-icon">🏠</span>
        <span>Home</span>
      </button>
      <h1>Expense Tracker</h1>
      <div className="sync-status">
        {isSyncing ? (
          <span className="syncing">Syncing...</span>
        ) : (
          syncStatus && (
            <span
              className={syncStatus.success ? "sync-success" : "sync-error"}
            >
              {syncStatus.message}
            </span>
          )
        )}
      </div>
    </nav>
  );
};

export default Navigation;
