// Export check service and types

export { CheckServiceApi } from "./check-service-api";

export type {
  ApiStatusResponse,
  CheckCnpjRequest,
  CheckCnpjResponse,
  CheckCpfRequest,
  CheckCpfResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  CheckProductNameRequest,
  CheckProductNameResponse,
  CheckProductSlugRequest,
  CheckProductSlugResponse,
  CheckRecordsType,
  CheckResult,
  CheckTaxonomySlugRequest,
  CheckTaxonomySlugResponse,
  CheckTypeConfig,
  CheckTypeConfigMap,
} from "./types/check-types";

export {
  CHECK_ERROR_MESSAGES,
  CHECK_SUCCESS_MESSAGES,
  CHECK_TYPE_CONFIGS,
  CheckError,
  CheckType,
  CheckValidationError,
  normalizeCnpj,
  normalizeCpf,
  normalizeEmail,
  normalizeProductName,
  normalizeSlug,
} from "./types/check-types";

export type {
  CheckCnpjInput,
  CheckCnpjPartialInput,
  CheckCpfInput,
  CheckCpfPartialInput,
  CheckEmailInput,
  CheckEmailPartialInput,
  CheckProductNameInput,
  CheckProductNamePartialInput,
  CheckProductSlugInput,
  CheckProductSlugPartialInput,
  CheckTaxonomySlugInput,
  CheckTaxonomySlugPartialInput,
} from "./validation/check-schemas";

export {
  CheckCnpjPartialSchema,
  CheckCnpjSchema,
  CheckCpfPartialSchema,
  CheckCpfSchema,
  CheckEmailPartialSchema,
  CheckEmailSchema,
  CheckProductNamePartialSchema,
  CheckProductNameSchema,
  CheckProductSlugPartialSchema,
  CheckProductSlugSchema,
  CheckTaxonomySlugPartialSchema,
  CheckTaxonomySlugSchema,
  isValidCnpjFormat,
  isValidCpfFormat,
  isValidEmailFormat,
  isValidMinLength,
  isValidSlugFormat,
} from "./validation/check-schemas";
