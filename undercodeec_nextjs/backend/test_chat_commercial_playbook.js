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

const priceReply = getStaticChatReply('Cuanto cuesta una pagina web?');
assertIncludes(priceReply, 'landing desde $80');
assertIncludes(priceReply, 'Para no recomendarte algo que no necesitas');

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
