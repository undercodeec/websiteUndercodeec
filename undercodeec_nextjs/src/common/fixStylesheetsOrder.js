export function fixRtlStylesheetsOrder() {
  const bootstrap_rtl = document.head.querySelector('link[href="/assets/css/lib/bootstrap.rtl.min.css"]');
  const style_css = document.head.querySelector('link[href="/assets/css/style.css"]');
  const style_rtl_css = document.head.querySelector('link[href="/assets/css/rtl_style.css"]');
  bootstrap_rtl && document.head.append(bootstrap_rtl);
  style_css && document.head.append(style_css);
  style_rtl_css && document.head.append(style_rtl_css);
}

export function fixPreviewStylesheetOrder() {
  const bootstrap_css = document.head.querySelector('link[href="/assets/css/lib/bootstrap.min.css"]');
  const style_css = document.head.querySelector('link[href="/assets/css/style.css"]');
  const preview_css = document.head.querySelector('link[href="/landing-preview/css/preview-style.css"]');
  bootstrap_css && document.head.append(bootstrap_css);
  style_css && document.head.append(style_css);
  preview_css && document.head.append(preview_css);
}
