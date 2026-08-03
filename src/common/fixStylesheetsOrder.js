
export function fixPreviewStylesheetOrder() {
  const bootstrap_css = document.head.querySelector('link[href="/assets/css/lib/bootstrap.min.css"]');
  const style_css = document.head.querySelector('link[href="/assets/css/style.css"]');
  const preview_css = document.head.querySelector('link[href="/landing-preview/css/preview-style.css"]');
  if (bootstrap_css) document.head.append(bootstrap_css);
  if (style_css) document.head.append(style_css);
  if (preview_css) document.head.append(preview_css);
}
