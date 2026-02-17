import { ChartAreaInteractive } from "@/app/dashboard/_components/panel/chart-area-interactive";
import data from "@/app/dashboard/_components/panel/data.json";
import { DataTable } from "@/app/dashboard/_components/panel/data-table";
import { SectionCards } from "@/app/dashboard/_components/panel/section-cards";
import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";

const Page = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[
          { label: "Dashboard", href: "#" },
          { label: "Relatório Geral", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
