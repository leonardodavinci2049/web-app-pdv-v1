import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthContext } from "@/server/auth-context";
import { getCrmLeadsByOrganization } from "@/services/db/crm-lead";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { CreateLeadDialog } from "../_components/create-lead-dialog";
import { LeadFilters } from "../_components/lead-filters";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  contact: "Contato",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Fechado",
  lost: "Perdido",
};

const _STATUS_LABELS: Record<string, string> = {
  open: "Aberto",
  won: "Ganho",
  lost: "Perdido",
};

interface LeadsPageProps {
  searchParams: Promise<{
    status?: string;
    stage?: string;
    source?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { session } = await getAuthContext();
  const organizationId = session.session?.activeOrganizationId ?? "";
  const params = await searchParams;

  const { leads } = await getCrmLeadsByOrganization({
    organizationId,
    status:
      params.status === "won" || params.status === "lost"
        ? params.status
        : undefined,
    stageKey: params.stage || undefined,
    source: params.source || undefined,
    limit: 100,
  });

  const filteredLeads =
    !params.status || params.status === "open"
      ? leads.filter((l) => l.status === "open")
      : leads;

  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Leads"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", href: "/dashboard/crm" },
          { label: "Leads", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Leads</h2>
            <p className="text-sm text-muted-foreground">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}{" "}
              encontrado{filteredLeads.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateLeadDialog />
        </div>

        <LeadFilters />

        <div className="grid grid-cols-1 gap-3">
          {filteredLeads.map((lead) => {
            const isOverdue =
              lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date();
            return (
              <Link key={lead.id} href={`/dashboard/crm/leads/${lead.id}`}>
                <Card className="border-border/60 bg-card/70 transition-colors hover:bg-accent/50">
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{lead.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {lead.phone && <span>{lead.phone}</span>}
                        {lead.email && <span>{lead.email}</span>}
                        <span>&middot; {lead.assignedUserName}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {STAGE_LABELS[lead.currentStageKey] ??
                          lead.currentStageKey}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {lead.source}
                      </Badge>
                      {lead.score > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Score: {lead.score}
                        </Badge>
                      )}
                      {lead.estimatedValue && (
                        <span className="text-xs font-medium">
                          {lead.estimatedValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {filteredLeads.length === 0 && (
            <Card className="border-border/60 bg-card/70">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  Nenhum lead encontrado.
                </p>
                <CreateLeadDialog />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
