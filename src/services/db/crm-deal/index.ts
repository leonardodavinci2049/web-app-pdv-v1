export type {
  CrmDeal,
  CrmDealStatus,
  ModifyResponse,
  ServiceResponse,
} from "./crm-deal.service";
export {
  CRM_DEAL_STATUSES,
  CRM_DEAL_TABLES,
  CrmDealService,
} from "./crm-deal.service";
export type { CrmDealResult, CrmDealsResult } from "./crm-deal-cached-service";
export {
  getCrmDealByLead,
  getCrmDealsByOrganization,
} from "./crm-deal-cached-service";
