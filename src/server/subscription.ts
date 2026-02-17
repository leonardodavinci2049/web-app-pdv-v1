"use server";

import { auth } from "@/lib/auth/auth";
import AuthService, {
  type ModifyResponse,
  type ServiceResponse,
  type Subscription,
} from "@/services/db/auth/auth.service";

// ============================================================================
// Types
// ============================================================================

export interface CreateSubscriptionInput {
  plan: string;
  status: string;
  approvedAt?: Date;
}

export interface UpdateSubscriptionInput {
  plan?: string;
  status?: string;
  approvedAt?: Date | null;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Cria uma nova subscription para o usuário autenticado
 *
 * @example
 * ```typescript
 * const result = await createSubscription({
 *   plan: "premium",
 *   status: "active"
 * });
 * ```
 */
export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<ServiceResponse<Subscription>> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        data: null,
        error: "Usuário não autenticado",
      };
    }

    return await AuthService.createSubscription({
      userId: session.user.id,
      plan: input.plan,
      status: input.status,
      approvedAt: input.approvedAt,
    });
  } catch (error) {
    console.error("[createSubscription] Erro:", error);
    return {
      success: false,
      data: null,
      error: "Erro ao criar subscription",
    };
  }
}

/**
 * Busca a subscription do usuário autenticado
 *
 * @example
 * ```typescript
 * const response = await getMySubscription();
 * if (response.success && response.data) {
 *   console.log(response.data.plan);
 * }
 * ```
 */
export async function getMySubscription(): Promise<
  ServiceResponse<Subscription | null>
> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        data: null,
        error: "Usuário não autenticado",
      };
    }

    return await AuthService.findSubscriptionByUserId({
      userId: session.user.id,
    });
  } catch (error) {
    console.error("[getMySubscription] Erro:", error);
    return {
      success: false,
      data: null,
      error: "Erro ao buscar subscription",
    };
  }
}

/**
 * Busca a subscription de um usuário específico (por ID)
 * Requer autenticação
 *
 * @example
 * ```typescript
 * const response = await getSubscriptionByUserId("user-123");
 * ```
 */
export async function getSubscriptionByUserId(
  userId: string,
): Promise<ServiceResponse<Subscription | null>> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        data: null,
        error: "Usuário não autenticado",
      };
    }

    return await AuthService.findSubscriptionByUserId({ userId });
  } catch (error) {
    console.error("[getSubscriptionByUserId] Erro:", error);
    return {
      success: false,
      data: null,
      error: "Erro ao buscar subscription",
    };
  }
}

/**
 * Busca uma subscription por ID
 * Requer autenticação
 *
 * @example
 * ```typescript
 * const response = await getSubscriptionById("sub-123");
 * ```
 */
export async function getSubscriptionById(
  subscriptionId: string,
): Promise<ServiceResponse<Subscription | null>> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        data: null,
        error: "Usuário não autenticado",
      };
    }

    return await AuthService.findSubscriptionById({ subscriptionId });
  } catch (error) {
    console.error("[getSubscriptionById] Erro:", error);
    return {
      success: false,
      data: null,
      error: "Erro ao buscar subscription",
    };
  }
}

/**
 * Atualiza a subscription do usuário autenticado
 *
 * @example
 * ```typescript
 * const result = await updateMySubscription({
 *   status: "cancelled"
 * });
 * ```
 */
export async function updateMySubscription(
  input: UpdateSubscriptionInput,
): Promise<ModifyResponse> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        affectedRows: 0,
        error: "Usuário não autenticado",
      };
    }

    // Primeiro busca a subscription do usuário
    const subscriptionResponse = await AuthService.findSubscriptionByUserId({
      userId: session.user.id,
    });

    if (!subscriptionResponse.success || !subscriptionResponse.data) {
      return {
        success: false,
        affectedRows: 0,
        error: "Subscription não encontrada",
      };
    }

    return await AuthService.updateSubscription({
      subscriptionId: subscriptionResponse.data.id,
      plan: input.plan,
      status: input.status,
      approvedAt: input.approvedAt,
    });
  } catch (error) {
    console.error("[updateMySubscription] Erro:", error);
    return {
      success: false,
      affectedRows: 0,
      error: "Erro ao atualizar subscription",
    };
  }
}

/**
 * Atualiza uma subscription específica por ID
 * Requer autenticação
 *
 * @example
 * ```typescript
 * const result = await updateSubscription("sub-123", {
 *   status: "active"
 * });
 * ```
 */
export async function updateSubscription(
  subscriptionId: string,
  input: UpdateSubscriptionInput,
): Promise<ModifyResponse> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        affectedRows: 0,
        error: "Usuário não autenticado",
      };
    }

    return await AuthService.updateSubscription({
      subscriptionId,
      plan: input.plan,
      status: input.status,
      approvedAt: input.approvedAt,
    });
  } catch (error) {
    console.error("[updateSubscription] Erro:", error);
    return {
      success: false,
      affectedRows: 0,
      error: "Erro ao atualizar subscription",
    };
  }
}

/**
 * Deleta a subscription do usuário autenticado
 *
 * @example
 * ```typescript
 * const result = await deleteMySubscription();
 * ```
 */
export async function deleteMySubscription(): Promise<ModifyResponse> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        affectedRows: 0,
        error: "Usuário não autenticado",
      };
    }

    // Primeiro busca a subscription do usuário
    const subscriptionResponse = await AuthService.findSubscriptionByUserId({
      userId: session.user.id,
    });

    if (!subscriptionResponse.success || !subscriptionResponse.data) {
      return {
        success: false,
        affectedRows: 0,
        error: "Subscription não encontrada",
      };
    }

    return await AuthService.deleteSubscription({
      subscriptionId: subscriptionResponse.data.id,
    });
  } catch (error) {
    console.error("[deleteMySubscription] Erro:", error);
    return {
      success: false,
      affectedRows: 0,
      error: "Erro ao deletar subscription",
    };
  }
}

/**
 * Deleta uma subscription específica por ID
 * Requer autenticação
 *
 * @example
 * ```typescript
 * const result = await deleteSubscription("sub-123");
 * ```
 */
export async function deleteSubscription(
  subscriptionId: string,
): Promise<ModifyResponse> {
  try {
    const session = await auth.api.getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        affectedRows: 0,
        error: "Usuário não autenticado",
      };
    }

    return await AuthService.deleteSubscription({ subscriptionId });
  } catch (error) {
    console.error("[deleteSubscription] Erro:", error);
    return {
      success: false,
      affectedRows: 0,
      error: "Erro ao deletar subscription",
    };
  }
}
