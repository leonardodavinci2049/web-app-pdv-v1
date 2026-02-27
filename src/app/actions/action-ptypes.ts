"use server";

import { createLogger } from "@/core/logger";
import { getAuthContext } from "@/server/auth-context";
import { ptypeServiceApi } from "@/services/api-main/ptype";
import {
  transformPtypeList,
  type UIPtype,
} from "@/services/api-main/ptype/transformers/transformers";

const logger = createLogger("ActionPtypes");

/**
 * Carrega lista de tipos de produto para uso em menus/selects
 */
export async function loadPtypesListAction(): Promise<{
  success: boolean;
  data: UIPtype[];
  message: string;
}> {
  try {
    const { apiContext } = await getAuthContext();

    const response = await ptypeServiceApi.findAllPtypes({
      pe_limit: 100,
      ...apiContext,
    });

    const ptypes = ptypeServiceApi.extractPtypes(response);
    return {
      success: true,
      data: transformPtypeList(ptypes),
      message: "Tipos de produto carregados com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao carregar tipos de produto na server action", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro ao carregar tipos de produto";
    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}
