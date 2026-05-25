import atlasLogo from "../assets/HexAtlasIcon.png";

function StatusPanel({
  actionLabel,
  message,
  onAction,
  title,
  variant = "info",
}) {
  return (
    <section
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`status-panel status-panel--${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <img alt="" aria-hidden="true" className="status-panel__logo" src={atlasLogo} />
      <div className="status-panel__content">
        <div className="status-panel__header">
          {variant === "loading" ? <span aria-hidden="true" className="spinner" /> : null}
          <div>
            <h4 className="status-panel__title">{title}</h4>
            <p className="status-panel__message">{message}</p>
          </div>
        </div>
        {actionLabel && onAction ? (
          <button className="ui-button ui-button--secondary" onClick={onAction} type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default StatusPanel;
