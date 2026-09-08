export function getTemplateHeaderType(template) {
  if (template?.headerType) return String(template.headerType).toUpperCase();
  const header = template?.components?.find(
    (component) => String(component?.type || "").toUpperCase() === "HEADER",
  );
  return header?.format ? String(header.format).toUpperCase() : null;
}

export function isVideoTemplateConfigured(template) {
  return getTemplateHeaderType(template) !== "VIDEO" || Boolean(template?.mediaConfiguration?.configured);
}

export function isMediaUploadPath(path, method) {
  return method === "POST" && path.length === 2 && path[0] === "campaigns" && path[1] === "media";
}

export async function loadCampaignWorkspace({ campaigns, templates, media }) {
  const [campaignResult, templateResult, mediaResult] = await Promise.allSettled([
    campaigns(), templates(), media(),
  ]);
  return {
    campaigns: campaignResult.status === "fulfilled" ? campaignResult.value?.data || [] : [],
    templates: templateResult.status === "fulfilled" ? templateResult.value || [] : [],
    media: mediaResult.status === "fulfilled" ? mediaResult.value || [] : [],
    campaignsError: campaignResult.status === "rejected" ? campaignResult.reason : null,
    templatesError: templateResult.status === "rejected" ? templateResult.reason : null,
    mediaError: mediaResult.status === "rejected" ? mediaResult.reason : null,
  };
}
