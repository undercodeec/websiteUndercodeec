import assert from "node:assert/strict";
import test from "node:test";
import {
  getTemplateHeaderType,
  isMediaUploadPath,
  isVideoTemplateConfigured,
  loadCampaignWorkspace,
} from "../src/lib/hermes/campaign-template-media.mjs";

test("recognizes a configured VIDEO template without trusting a visible name", () => {
  assert.equal(getTemplateHeaderType({ components: [{ type: "HEADER", format: "VIDEO" }] }), "VIDEO");
  assert.equal(isVideoTemplateConfigured({ headerType: "VIDEO", mediaConfiguration: { configured: true } }), true);
  assert.equal(isVideoTemplateConfigured({ headerType: "VIDEO", mediaConfiguration: { configured: false } }), false);
  assert.equal(isVideoTemplateConfigured({ headerType: "TEXT", mediaConfiguration: { configured: false } }), true);
});

test("keeps approved templates when the media library request fails", async () => {
  const workspace = await loadCampaignWorkspace({
    campaigns: async () => ({ data: [{ id: "campaign-1" }] }),
    templates: async () => [{ id: "template-1", name: "promo" }],
    media: async () => { throw new Error("media unavailable"); },
  });

  assert.deepEqual(workspace.campaigns, [{ id: "campaign-1" }]);
  assert.deepEqual(workspace.templates, [{ id: "template-1", name: "promo" }]);
  assert.deepEqual(workspace.media, []);
  assert.match(workspace.mediaError.message, /media unavailable/);
});

test("streams only the campaign media upload route", () => {
  assert.equal(isMediaUploadPath(["campaigns", "media"], "POST"), true);
  assert.equal(isMediaUploadPath(["campaigns", "media", "register"], "POST"), false);
  assert.equal(isMediaUploadPath(["campaigns", "media"], "GET"), false);
});
