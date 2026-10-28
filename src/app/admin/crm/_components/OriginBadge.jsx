import { originLabel } from '@/lib/hermes/meta-attribution.mjs';

export default function OriginBadge({ attribution, compact = false }) {
  const origin = attribution?.origin || 'unknown';
  return (
    <span className={`crm-origin-badge is-${origin}${compact ? ' is-compact' : ''}`} title={attribution?.evidence || 'insufficient'}>
      <i aria-hidden="true" />{originLabel(origin)}
    </span>
  );
}
