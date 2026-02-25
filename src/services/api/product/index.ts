// Export product service and types

export { ProductServiceApi } from "./product-service-api";

export type {
  // Request types - Create
  CreateProductRequest,
  // Response types
  CreateProductResponse,
  // Request types - Query
  FindProductByIdRequest,
  FindProductByIdResponse,
  FindProductsRequest,
  FindProductsResponse,
  // Data types
  MySQLMetadata,
  ProductDetail,
  ProductListItem,
  StoredProcedureResponse,
  // Request types - Update
  UpdateProductBrandRequest,
  UpdateProductCharacteristicsRequest,
  UpdateProductDescriptionRequest,
  UpdateProductFlagsRequest,
  UpdateProductGeneralRequest,
  UpdateProductNameRequest,
  UpdateProductPriceRequest,
  UpdateProductResponse,
  UpdateProductShortDescriptionRequest,
  UpdateProductStockRequest,
  UpdateProductTaxValuesRequest,
  UpdateProductTypeRequest,
  UpdateProductVariousRequest,
} from "./types/product-types";
