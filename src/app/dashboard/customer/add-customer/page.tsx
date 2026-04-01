import { SiteHeaderWithBreadcrumb } from "@/components/dashboard/header/site-header-with-breadcrumb";
import { CustomerForm } from "./_components/customer-form";

const AddCustomerPage = () => {
  return (
    <>
      <SiteHeaderWithBreadcrumb
        title="Adicionar Novo Cliente"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clientes", href: "/dashboard/customer/customer-list" },
          { label: "Adicionar Novo Cliente", isActive: true },
        ]}
      />

      <div className="flex flex-1 flex-col">
        <div className="@container/main mx-auto w-full max-w-200 flex-1 flex-col gap-6 px-4 lg:px-6 py-6">
          <div className="space-y-1 pb-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Novo Cliente
            </h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo para cadastrar um novo cliente no sistema
            </p>
          </div>
          <CustomerForm />
        </div>
      </div>
    </>
  );
};

export default AddCustomerPage;
