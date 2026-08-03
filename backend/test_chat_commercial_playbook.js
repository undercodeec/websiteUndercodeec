const assert = require('assert');
const {
  buildCommercialSnapshot,
  buildWhatsAppUrl,
  classifyCommercialIntent,
  getStaticChatReply,
} = require('./chatCommercialPlaybook');

function assertIncludes(value, expected) {
  assert.ok(
    String(value).includes(expected),
    `Expected "${value}" to include "${expected}"`
  );
}

const priceIntent = classifyCommercialIntent('Cuanto cuesta una pagina web?');
assert.strictEqual(priceIntent.intent, 'faq_price');
assert.strictEqual(priceIntent.shouldOfferPayment, false);

// Primer toque de precio: rango gancho (una landing), no la tabla completa.
const priceReply = getStaticChatReply('Cuanto cuesta una pagina web?');
assertIncludes(priceReply, 'desde $80');
assertIncludes(priceReply, 'Para no recomendarte algo que no necesitas');
assert.ok(!priceReply.includes('tienda online desde'), 'El primer toque no debe volcar todos los planes');

// "Cotizar un proyecto nuevo" ya no se trata como consulta de precios:
// debe pasar a diagnostico (sin respuesta estatica de precios).
const quoteIntent = classifyCommercialIntent('Quiero cotizar un proyecto nuevo');
assert.notStrictEqual(quoteIntent.intent, 'faq_price');
assert.strictEqual(getStaticChatReply('Quiero cotizar un proyecto nuevo'), null);

// En seguimiento (mas de un turno del usuario) las intenciones consultivas
// las maneja el modelo con contexto: no se repite el bloque estatico.
const followUpHistory = [
  { role: 'assistant', content: 'Hola, soy Karen.' },
  { role: 'user', content: 'Quiero cotizar un proyecto nuevo' },
  { role: 'assistant', content: 'Cual es el objetivo principal?' },
  { role: 'user', content: 'Ya compre hosting y quiero saber el costo total y el tiempo' },
];
assert.strictEqual(getStaticChatReply('Ya compre hosting y quiero saber el costo total', followUpHistory), null);
// El primer toque de precio si conserva la respuesta estatica barata.
assert.ok(getStaticChatReply('Cuanto cuesta una pagina web?', [{ role: 'user', content: 'Cuanto cuesta una pagina web?' }]));

const seoIntent = classifyCommercialIntent('Quiero aparecer en Google con SEO');
assert.strictEqual(seoIntent.intent, 'seo_marketing');

const seoReply = getStaticChatReply('Hacen Google Ads y SEO?');
assertIncludes(seoReply, 'SEO basico inicia desde $50');
assertIncludes(seoReply, 'SEO organico, anuncios pagados o ambos');

const handoffIntent = classifyCommercialIntent('Quiero hablar con un asesor por WhatsApp');
assert.strictEqual(handoffIntent.intent, 'human_handoff');

const purchaseIntent = classifyCommercialIntent('Me interesa, quiero empezar. Como pago?');
assert.strictEqual(purchaseIntent.intent, 'purchase_ready');
assert.strictEqual(purchaseIntent.shouldOfferPayment, true);
assert.strictEqual(getStaticChatReply('Me interesa, quiero empezar. Como pago?'), null);

const hotSnapshot = buildCommercialSnapshot('Tengo presupuesto de $500, es urgente y quiero captar clientes por WhatsApp');
assert.ok(hotSnapshot.leadScore >= 65, `Expected commercial score >= 65, got ${hotSnapshot.leadScore}`);
assert.strictEqual(hotSnapshot.shouldOfferPayment, false);

const urlSnapshot = buildCommercialSnapshot('Mi web actual es https://example.com y quiero mejorarla');
assert.strictEqual(urlSnapshot.intent, 'redesign');
assert.ok(urlSnapshot.leadScore >= 40, `Expected URL redesign score >= 40, got ${urlSnapshot.leadScore}`);

const waUrl = buildWhatsAppUrl('seo_marketing', { name: 'Ana', projectType: 'Aparecer en Google' });
assertIncludes(decodeURIComponent(waUrl), 'Ana');
assertIncludes(decodeURIComponent(waUrl), 'Aparecer en Google');

console.log('chatCommercialPlaybook tests passed');
