import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";

const logger = createLogger("AuthContext");

export async function getAuthContext() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const personId = session.user.personId;
  if (!personId) {
    logger.warn(
      `Usuário ${session.user.id} sem personId preenchido. Usando fallback 0.`,
    );
  }

  return {
    session,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: session.session?.activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: personId ?? 0,
    },
  };
}
