import OriginBadge from './OriginBadge';
import { safeAdId } from '@/lib/hermes/meta-attribution.mjs';

const EVIDENCE = {
  meta_referral_ad: 'Referencia publicitaria de Meta',
  meta_ctwa_clid: 'Clic de anuncio a WhatsApp',
  meta_referral_post: 'Referencia a publicación orgánica',
  insufficient: 'No hay evidencia suficiente para clasificar el origen',
};

export default function AttributionDetails({ attribution }) {
  const adId = safeAdId(attribution?.initialAdSourceId);
  const references = attribution?.laterAdReferences || [];
  return (
    <div className="crm-origin-details">
      <div className="crm-origin-details-head">
        <OriginBadge attribution={attribution} />
        <small>{EVIDENCE[attribution?.evidence] || EVIDENCE.insufficient}</small>
      </div>
      {adId && <p>ID inicial del anuncio: <strong>{adId}</strong></p>}
      {attribution?.ctwaClidPresent && <p>Identificador de clic: presente; valor oculto.</p>}
      {references.length > 0 && (
        <div className="crm-origin-references">
          <strong>Referencias publicitarias posteriores ({references.length})</strong>
          <ul>
            {references.map((reference) => (
              <li key={reference.messageId}>
                <time>{new Date(reference.occurredAt).toLocaleString('es-EC')}</time>
                <span>{safeAdId(reference.sourceId) ? `ID ${reference.sourceId}` : 'Anuncio sin ID disponible'}</span>
                {reference.ctwaClidPresent && <small>Clic identificado</small>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {references.length === 0 && <small>No hay referencias publicitarias posteriores registradas.</small>}
    </div>
  );
}
