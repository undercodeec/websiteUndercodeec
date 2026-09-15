import assert from "node:assert/strict";
import test from "node:test";

test("builds a layered mobile product scene that stays inside its viewport", async () => {
  const { createMobileAppScene } = await import("../src/components/Saas/About/mobileAppScene.mjs");
  const scene = createMobileAppScene({
    width: 500,
    height: 620,
    elapsed: 2200,
    pointerX: 1,
    pointerY: -1,
  });

  assert.deepEqual(scene.layers.map(({ kind }) => kind), ["overview", "insights", "actions"]);
  assert.equal(scene.navigation.length, 4);
  assert.equal(scene.notification.label, "Pago confirmado");
  assert.ok(scene.parallax.x > 0);
  assert.ok(scene.parallax.y < 0);
  assert.ok(scene.device.x >= 0);
  assert.ok(scene.device.y >= 0);
  assert.ok(scene.device.x + scene.device.width <= 500);
  assert.ok(scene.device.y + scene.device.height <= 620);
});

test("scales the product scene for a narrow mobile viewport", async () => {
  const { createMobileAppScene } = await import("../src/components/Saas/About/mobileAppScene.mjs");
  const scene = createMobileAppScene({ width: 280, height: 420, elapsed: 0 });

  assert.ok(scene.device.width < 200);
  assert.ok(scene.device.height < 380);
  assert.ok(scene.layers.every(({ width }) => width > 0));
  assert.ok(scene.touch.radius > 0);
});
