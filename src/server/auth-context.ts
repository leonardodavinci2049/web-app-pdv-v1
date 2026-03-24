import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/core/logger";
import { auth } from "@/lib/auth/auth";
import { AuthService } from "@/services/db/auth/auth.service";

const logger = createLogger("AuthContext");

export async function getAuthContext() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const activeOrganizationId = session.session?.activeOrganizationId;

  let personId = 0;

  if (!activeOrganizationId) {
    logger.warn(
      `Sessão do usuário ${session.user.id} sem organização ativa. Usando fallback 0 para pe_person_id.`,
    );
  } else {
    const memberResponse = await AuthService.findMemberByUserAndOrganization({
      userId: session.user.id,
      organizationId: activeOrganizationId,
    });

    if (!memberResponse.success) {
      logger.warn(
        `Falha ao resolver member ativo do usuário ${session.user.id} na organização ${activeOrganizationId}. Usando fallback 0 para pe_person_id.`,
        {
          error: memberResponse.error,
        },
      );
    } else if (!memberResponse.data) {
      logger.warn(
        `Nenhum member encontrado para o usuário ${session.user.id} na organização ${activeOrganizationId}. Usando fallback 0 para pe_person_id.`,
      );
    } else if (!memberResponse.data.personId) {
      logger.warn(
        `Member ${memberResponse.data.id} do usuário ${session.user.id} na organização ${activeOrganizationId} sem personId preenchido. Usando fallback 0 para pe_person_id.`,
      );
    } else {
      personId = memberResponse.data.personId;
    }
  }

  return {
    session,
    apiContext: {
      pe_system_client_id: session.session?.systemId ?? 0,
      pe_organization_id: activeOrganizationId ?? "0",
      pe_user_id: session.user.id ?? "0",
      pe_user_name: session.user.name ?? "",
      pe_user_role: session.user.role ?? "admin",
      pe_person_id: personId,
    },
  };
}
