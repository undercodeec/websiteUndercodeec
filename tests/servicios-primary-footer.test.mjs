import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("legal footer links use their label as part of the React key", async () => {
  const source = await readFile("src/components/Servicios/ServiciosPrimaryFooter.jsx", "utf8");

  assert.match(
    source,
    /links\.map\(\(link\) => <FooterLink key=\{`\$\{link\.href\}-\$\{link\.label\}`\} link=\{link\} \/>\)/,
  );
  assert.doesNotMatch(
    source,
    /links\.map\(\(link\) => <FooterLink key=\{link\.href\} link=\{link\} \/>\)/,
  );
});
