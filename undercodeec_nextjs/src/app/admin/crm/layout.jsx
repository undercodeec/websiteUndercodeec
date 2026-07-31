import CrmShell from "./_components/CrmShell";
import { CrmSessionProvider } from "./_components/CrmSession";
import "./crm.css";

export const metadata = {
  title: "Hermes CRM | Undercodeec",
  description: "Gestión interna de leads y conversaciones de Hermes.",
  robots: { index: false, follow: false },
};

export default function CrmLayout({ children }) {
  return (
    <CrmSessionProvider>
      <CrmShell>{children}</CrmShell>
    </CrmSessionProvider>
  );
}
