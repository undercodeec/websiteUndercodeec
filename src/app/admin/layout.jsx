import { headers } from "next/headers";
import { notFound } from "next/navigation";

const CRM_HOST = "admincrm.undercodeec.com";

export default async function AdminLayout({ children }) {
  if (process.env.NODE_ENV === "production") {
    const host = ((await headers()).get("host") || "")
      .split(":")[0]
      .toLowerCase();

    if (host !== CRM_HOST) notFound();
  }

  return children;
}
