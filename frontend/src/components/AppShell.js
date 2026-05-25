import atlasLogo from "../assets/HexAtlasIcon.png";

function AppShell({
  children,
  onRefresh,
  onRoleChange,
  onSearchChange,
  role,
  searchQuery,
}) {
  return (
    <div className="dashboard-layout">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar" aria-label="Primary">
        <div className="brand-lockup">
          <img
            alt="Atlas Robotic Supply logo"
            className="brand-logo"
            src={atlasLogo}
          />
          <div>
            <p className="brand-kicker">Inventory Command Center</p>
            <h1 className="brand-title">Atlas Robotic Supply</h1>
          </div>
        </div>
        <div className="topbar-actions" aria-label="Quick actions">
          <label className="sr-only" htmlFor="role-selector">
            Select user role
          </label>
          <select
            aria-label="Select user role"
            className="ui-input ui-select role-select"
            id="role-selector"
            name="role"
            onChange={(event) => onRoleChange(event.target.value)}
            value={role}
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <label className="sr-only" htmlFor="global-search">
            Search products and metrics
          </label>
          <input
            aria-label="Search products and metrics"
            className="ui-input topbar-search"
            id="global-search"
            name="global-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search inventory"
            type="search"
            value={searchQuery}
          />
          <button
            aria-label="Refresh dashboard data"
            className="ui-button ui-button--secondary"
            onClick={onRefresh}
            type="button"
          >
            Sync Data
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar" aria-label="Sidebar navigation">
          <nav>
            <ul className="nav-list">
              <li>
                <a aria-current="page" className="nav-link nav-link--active" href="#dashboard">
                  Dashboard
                </a>
              </li>
              <li>
                <a className="nav-link" href="#inventory">
                  Inventory
                </a>
              </li>
              <li>
                <a className="nav-link" href="#analytics">
                  Analytics
                </a>
              </li>
              <li>
                <a className="nav-link" href="#operations">
                  Operations
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="dashboard-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
