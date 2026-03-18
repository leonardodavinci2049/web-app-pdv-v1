import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";

export default async function DashboardPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeaderWithBreadcrumb
        title="Dashboard"
        breadcrumbItems={[{ label: "Dashboard", isActive: true }]}
      />

      <div className="flex flex-1 items-center justify-center px-4 py-10 md:px-6">
        <div className="w-full max-w-3xl rounded-[28px] border border-border/70 bg-card px-6 py-10 text-center shadow-xl shadow-black/5">
          <p className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            seja bem vindo ao dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
