export type {
  CrmLead,
  CrmLeadSource,
  CrmLeadStatus,
  CrmLeadSummary,
  ModifyResponse,
  ServiceResponse,
} from "./crm-lead.service";
export {
  CRM_LEAD_SOURCES,
  CRM_LEAD_STATUSES,
  CRM_LEAD_TABLES,
  CrmLeadService,
} from "./crm-lead.service";
export type {
  CrmLeadResult,
  CrmLeadStageCountResult,
  CrmLeadsResult,
} from "./crm-lead-cached-service";
export {
  getCrmLeadById,
  getCrmLeadStageCount,
  getCrmLeadsByOrganization,
  getCrmLeadsByStageGrouped,
} from "./crm-lead-cached-service";
