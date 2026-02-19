import "server-only";

import { envs } from "@/core/config";
import {
  API_STATUS_CODES,
  BRAND_ENDPOINTS,
  isApiError,
  isApiSuccess,
} from "@/core/constants/api-constants";
import { createLogger } from "@/core/logger";
import { BaseApiService } from "@/lib/axios/base-api-service";

import type {
  BrandData,
  BrandDetail,
  CreateBrandRequest,
  CreateBrandResponse,
  DeleteBrandRequest,
  DeleteBrandResponse,
  FindAllBrandRequest,
  FindAllBrandResponse,
  FindByIdBrandRequest,
  FindByIdBrandResponse,
  StoredProcedureResponse,
  UpdateBrandRequest,
  UpdateBrandResponse,
} from "./types/brand-types";
import { BrandError, BrandNotFoundError } from "./types/brand-types";
import {
  CreateBrandSchema,
  DeleteBrandSchema,
  FindAllBrandSchema,
  FindByIdBrandSchema,
  UpdateBrandSchema,
} from "./validation/brand-schemas";

const logger = createLogger("BrandService");

export class BrandServiceApi extends BaseApiService {
  private static buildBasePayload(
    additionalData: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      pe_app_id: envs.APP_ID,
      pe_system_client_id: envs.SYSTEM_CLIENT_ID,
      pe_store_id: envs.STORE_ID,
      ...additionalData,
    };
  }

  static async createBrand(
    params: Partial<CreateBrandRequest> &
      Pick<CreateBrandRequest, "pe_brand" | "pe_slug"> &
      Pick<
        CreateBrandRequest,
        "pe_organization_id" | "pe_user_id" | "pe_member_role" | "pe_person_id"
      >,
  ): Promise<CreateBrandResponse> {
    try {
      const payloadInput = {
        pe_brand: params.pe_brand,
        pe_slug: params.pe_slug,
        pe_organization_id: params.pe_organization_id,
        pe_user_id: params.pe_user_id,
        pe_member_role: params.pe_member_role,
        pe_person_id: params.pe_person_id,
      };

      const validatedParams = CreateBrandSchema.parse(payloadInput);

      const instance = new BrandServiceApi();
      const requestBody = BrandServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<CreateBrandResponse>(
        BRAND_ENDPOINTS.CREATE,
        requestBody,
      );

      if (isApiError(response.statusCode)) {
        throw new BrandError(
          response.message || "Erro ao cadastrar marca",
          "BRAND_CREATE_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro no serviço de marcas (criação)", error);
      throw error;
    }
  }

  static async findAllBrands(
    params: Partial<FindAllBrandRequest> &
      Pick<
        FindAllBrandRequest,
        "pe_organization_id" | "pe_user_id" | "pe_member_role" | "pe_person_id"
      >,
  ): Promise<FindAllBrandResponse> {
    try {
      const payloadInput = {
        pe_brand_id: params.pe_brand_id ?? 0,
        pe_brand: params.pe_brand ?? "",
        pe_limit: params.pe_limit ?? 100,
        pe_organization_id: params.pe_organization_id,
        pe_user_id: params.pe_user_id,
        pe_member_role: params.pe_member_role,
        pe_person_id: params.pe_person_id,
      };

      const validatedParams = FindAllBrandSchema.parse(payloadInput);

      const instance = new BrandServiceApi();
      const requestBody = BrandServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<FindAllBrandResponse>(
        BRAND_ENDPOINTS.FIND_ALL,
        requestBody,
      );

      return BrandServiceApi.handleFindAllResponse(response);
    } catch (error) {
      logger.error("Erro no serviço de marcas (listar todas)", error);
      throw error;
    }
  }

  static async findByIdBrand(
    params: Partial<FindByIdBrandRequest> &
      Pick<FindByIdBrandRequest, "pe_brand_id"> &
      Pick<
        FindByIdBrandRequest,
        "pe_organization_id" | "pe_user_id" | "pe_member_role" | "pe_person_id"
      >,
  ): Promise<FindByIdBrandResponse> {
    try {
      const payloadInput = {
        pe_brand_id: params.pe_brand_id,
        pe_organization_id: params.pe_organization_id,
        pe_user_id: params.pe_user_id,
        pe_member_role: params.pe_member_role,
        pe_person_id: params.pe_person_id,
      };

      const validatedParams = FindByIdBrandSchema.parse(payloadInput);

      const instance = new BrandServiceApi();
      const requestBody = BrandServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<FindByIdBrandResponse>(
        BRAND_ENDPOINTS.FIND_BY_ID,
        requestBody,
      );

      if (response.statusCode === API_STATUS_CODES.NOT_FOUND) {
        throw new BrandNotFoundError(validatedParams);
      }

      if (isApiError(response.statusCode)) {
        throw new BrandError(
          response.message || "Erro ao buscar marca por ID",
          "BRAND_FIND_BY_ID_ERROR",
          response.statusCode,
        );
      }

      const hasBrandData =
        Array.isArray(response.data?.["Brand find All"]) &&
        response.data["Brand find All"].length > 0;

      if (!hasBrandData) {
        throw new BrandNotFoundError(validatedParams);
      }

      return response;
    } catch (error) {
      logger.error("Erro no serviço de marcas (busca por ID)", error);
      throw error;
    }
  }

  static async updateBrand(
    params: Partial<UpdateBrandRequest> &
      Pick<UpdateBrandRequest, "pe_brand_id"> &
      Pick<
        UpdateBrandRequest,
        "pe_organization_id" | "pe_user_id" | "pe_member_role" | "pe_person_id"
      >,
  ): Promise<UpdateBrandResponse> {
    try {
      const payloadInput = {
        pe_brand_id: params.pe_brand_id,
        pe_brand: params.pe_brand,
        pe_slug: params.pe_slug,
        pe_image_path: params.pe_image_path,
        pe_notes: params.pe_notes,
        pe_inactive: params.pe_inactive,
        pe_organization_id: params.pe_organization_id,
        pe_user_id: params.pe_user_id,
        pe_member_role: params.pe_member_role,
        pe_person_id: params.pe_person_id,
      };

      const validatedParams = UpdateBrandSchema.parse(payloadInput);

      const instance = new BrandServiceApi();
      const requestBody = BrandServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<UpdateBrandResponse>(
        BRAND_ENDPOINTS.UPDATE,
        requestBody,
      );

      if (isApiError(response.statusCode)) {
        throw new BrandError(
          response.message || "Erro ao atualizar marca",
          "BRAND_UPDATE_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro no serviço de marcas (atualização)", error);
      throw error;
    }
  }

  static async deleteBrand(
    params: Partial<DeleteBrandRequest> &
      Pick<DeleteBrandRequest, "pe_brand_id"> &
      Pick<
        DeleteBrandRequest,
        "pe_organization_id" | "pe_user_id" | "pe_member_role" | "pe_person_id"
      >,
  ): Promise<DeleteBrandResponse> {
    try {
      const payloadInput = {
        pe_brand_id: params.pe_brand_id,
        pe_organization_id: params.pe_organization_id,
        pe_user_id: params.pe_user_id,
        pe_member_role: params.pe_member_role,
        pe_person_id: params.pe_person_id,
      };

      const validatedParams = DeleteBrandSchema.parse(payloadInput);

      const instance = new BrandServiceApi();
      const requestBody = BrandServiceApi.buildBasePayload({
        ...validatedParams,
      });

      const response = await instance.post<DeleteBrandResponse>(
        BRAND_ENDPOINTS.DELETE,
        requestBody,
      );

      if (isApiError(response.statusCode)) {
        throw new BrandError(
          response.message || "Erro ao excluir marca",
          "BRAND_DELETE_ERROR",
          response.statusCode,
        );
      }

      return response;
    } catch (error) {
      logger.error("Erro no serviço de marcas (exclusão)", error);
      throw error;
    }
  }

  private static handleFindAllResponse(
    response: FindAllBrandResponse,
  ): FindAllBrandResponse {
    if (
      response.statusCode === API_STATUS_CODES.EMPTY_RESULT ||
      response.statusCode === API_STATUS_CODES.NOT_FOUND ||
      response.statusCode === API_STATUS_CODES.UNPROCESSABLE
    ) {
      return {
        ...response,
        statusCode: API_STATUS_CODES.SUCCESS,
        quantity: 0,
        data: {
          "Brand find All": [],
        },
      };
    }

    if (isApiError(response.statusCode)) {
      throw new BrandError(
        response.message || "Erro ao listar marcas",
        "BRAND_FIND_ALL_ERROR",
        response.statusCode,
      );
    }

    return response;
  }

  static extractBrandList(response: FindAllBrandResponse): BrandData[] {
    return response.data?.["Brand find All"] ?? [];
  }

  static extractBrandDetail(
    response: FindByIdBrandResponse,
  ): BrandDetail | null {
    return response.data?.["Brand find All"]?.[0] ?? null;
  }

  static extractStoredProcedureResponse(
    response: CreateBrandResponse | UpdateBrandResponse | DeleteBrandResponse,
  ): StoredProcedureResponse | null {
    return response.data?.[0] ?? null;
  }

  static isValidFindAllBrandResponse(response: FindAllBrandResponse): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"])
    );
  }

  static isValidFindByIdBrandResponse(
    response: FindByIdBrandResponse,
  ): boolean {
    return (
      isApiSuccess(response.statusCode) &&
      response.data &&
      Array.isArray(response.data["Brand find All"]) &&
      response.data["Brand find All"].length > 0
    );
  }

  static isOperationSuccessful(
    response: CreateBrandResponse | UpdateBrandResponse | DeleteBrandResponse,
  ): boolean {
    const spResponse = BrandServiceApi.extractStoredProcedureResponse(response);
    return spResponse ? spResponse.sp_error_id === 0 : false;
  }
}
