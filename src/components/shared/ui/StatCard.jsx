import React from 'react';

/**
 * KPI summary card used in dashboard and module overview rows.
 *
 * @param {React.ElementType} icon - Lucide icon component
 * @param {string|number} value - Primary metric value
 * @param {string} label - Metric label
 * @param {number} [change] - Percentage change vs. prior period (positive = up)
 * @param {'blue'|'green'|'orange'|'purple'|'pink'|'cyan'|'red'} [color='blue']
 * @param {string} [prefix] - Optional prefix before value (e.g. '$')
 */
export default function StatCard({ icon: Icon, value, label, change, color = 'blue', prefix = '' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={18} />}
      </div>
      <div className="stat-value">{prefix}{value}</div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  );
}
