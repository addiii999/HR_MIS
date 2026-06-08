import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Unified page header used across all modules.
 * Renders: optional breadcrumb trail, icon, title, subtitle, and action buttons.
 *
 * @param {string} title - Primary heading text
 * @param {string} [subtitle] - Secondary descriptor shown below the title
 * @param {Array}  [breadcrumbs] - Array of { label, path? } objects
 * @param {ReactNode} [actions] - Buttons or controls rendered top-right
 * @param {ReactNode} [icon] - Lucide icon element shown left of the title
 */
export default function PageHeader({ title, subtitle, breadcrumbs = [], actions, icon }) {
  return (
    <div className="page-header animate-in">
      {breadcrumbs.length > 0 && (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/dashboard" className="breadcrumb-item">Dashboard</Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              <ChevronRight size={12} className="breadcrumb-sep" />
              {crumb.path ? (
                <Link to={crumb.path} className="breadcrumb-item">{crumb.label}</Link>
              ) : (
                <span className="breadcrumb-item current">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="page-header-row">
        <div className="page-header-text">
          {icon && <div className="page-header-icon">{icon}</div>}
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
