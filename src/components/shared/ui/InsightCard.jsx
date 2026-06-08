/**
 * Decision-support insight card shown in the Dashboard analytics section.
 * Displays a labelled tag and a short actionable insight description.
 *
 * @param {string} tag - Short category label (e.g. 'Best Hiring Platform')
 * @param {string} text - Insight body text
 */
export default function InsightCard({ tag, text }) {
  return (
    <div className="insight-card">
      <div className="insight-tag">{tag}</div>
      <p>{text}</p>
    </div>
  );
}
