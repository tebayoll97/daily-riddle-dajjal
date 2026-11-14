export function Breadcrumbs({ items = [], className = "", ariaLabel = "Breadcrumb" }) {
  return (
    <nav aria-label={ariaLabel} className={["ui-breadcrumbs", className].filter(Boolean).join(" ")}>
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.href || item.label}>
              {current ? <span aria-current="page">{item.label}</span> : <a href={item.href}>{item.label}</a>}
              {!current ? <span className="ui-breadcrumb-separator" aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
