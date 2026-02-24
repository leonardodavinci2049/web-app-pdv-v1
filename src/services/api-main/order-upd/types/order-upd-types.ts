import "server-only";

interface OrderUpdBaseRequest {
  pe_app_id?: number;
  pe_system_client_id?: number;
  pe_store_id?: number;
  pe_organization_id?: string;
  pe_user_id?: string;
  pe_user_name?: string;
  pe_user_role?: string;
  pe_person_id?: number;
  pe_order_id?: number;
}

interface OrderUpdBaseResponse {
  statusCode: number;
  message: string;
  recordId: number;
  quantity: number;
  errorId: number;
  info1?: string;
}

// === Stored Procedure Response ===

export interface StoredProcedureResponse {
  sp_return_id: number;
  sp_message: string;
  sp_error_id: number;
}

// === Request Interfaces ===

export interface OrderUpdCustomerRequest extends OrderUpdBaseRequest {
  pe_customer_id?: number;
}

export interface OrderUpdDiscountRequest extends OrderUpdBaseRequest {
  pe_discount_value?: number;
}

export interface OrderUpdFreteRequest extends OrderUpdBaseRequest {
  pe_frete_value?: number;
}

export interface OrderUpdNotesRequest extends OrderUpdBaseRequest {
  pe_notes?: string;
}

export interface OrderUpdPgMethodRequest extends OrderUpdBaseRequest {
  pe_pg_method_id?: number;
}

export interface OrderUpdSellerRequest extends OrderUpdBaseRequest {
  pe_seller_id?: number;
}

export interface OrderUpdStatusRequest extends OrderUpdBaseRequest {
  pe_status_id?: number;
}

// === Response Interfaces ===

export interface OrderUpdCustomerResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderUpdDiscountResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderUpdFreteResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderUpdNotesResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderUpdPgMethodResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderUpdSellerResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

export interface OrderUpdStatusResponse extends OrderUpdBaseResponse {
  data: StoredProcedureResponse[];
}

// === Error Classes ===

export class OrderUpdError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "OrderUpdError";
    Object.setPrototypeOf(this, OrderUpdError.prototype);
  }
}

export class OrderUpdNotFoundError extends OrderUpdError {
  constructor(params?: Record<string, unknown>) {
    const message = params
      ? `Pedido não encontrado com os parâmetros: ${JSON.stringify(params)}`
      : "Pedido não encontrado";
    super(message, "ORDER_UPD_NOT_FOUND", 100404);
    this.name = "OrderUpdNotFoundError";
    Object.setPrototypeOf(this, OrderUpdNotFoundError.prototype);
  }
}

export class OrderUpdValidationError extends OrderUpdError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message, "ORDER_UPD_VALIDATION_ERROR", 100400);
    this.name = "OrderUpdValidationError";
    Object.setPrototypeOf(this, OrderUpdValidationError.prototype);
  }
}
