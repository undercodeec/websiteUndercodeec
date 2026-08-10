"use client";

import AdminDashboard from "../../dashboard/page";
import { PageHeader } from "../_components/Ui";

export default function UnifiedAdministrationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operación administrativa"
        title="Administración general"
        description="Pagos, formularios, facturación, uso del asistente y configuración en el mismo panel de Hermes CRM."
      />
      <AdminDashboard embedded />
    </>
  );
}
