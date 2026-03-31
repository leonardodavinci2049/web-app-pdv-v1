import { SiteHeaderWithBreadcrumb } from "../../_components/header/site-header-with-breadcrumb";
import { CustomerForm } from "./_components/customer-form";

const AddCustomerPage = () => {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6 md:py-8">
      <SiteHeaderWithBreadcrumb
        title="Adicionar Novo Cliente"
        breadcrumbItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clientes", href: "/dashboard/customer/customer-list" },
          { label: "Adicionar Novo Cliente", isActive: true },
        ]}
      />
      <CustomerForm />
    </div>
  );
};

export default AddCustomerPage;
