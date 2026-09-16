import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("keeps Next and React as the only active frontend stack", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const nextConfig = await readFile("next.config.ts", "utf8");

  assert.equal(packageJson.dependencies.next, "16.1.2");
  assert.equal(packageJson.dependencies.react, "19.2.3");
  assert.equal(packageJson.dependencies["react-dom"], "19.2.3");
  assert.equal(packageJson.devDependencies.astro, undefined);
  await assert.rejects(access("apps/web/package.json"));
  assert.match(
    nextConfig,
    /source:\s*"\/"[\s\S]*destination:\s*"\/landing-primary\/index\.html"/,
  );
  assert.match(
    nextConfig,
    /source:\s*"\/demos"[\s\S]*destination:\s*"\/landing-primary\/index\.html"/,
  );

  for (const dependency of ["clsx", "rc-slider", "tailwind-merge"]) {
    assert.equal(packageJson.dependencies[dependency], undefined, dependency);
  }
});
