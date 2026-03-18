import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  PackageSearch,
  Settings,
  Store,
  Target,
  Users,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { SiteHeaderWithBreadcrumb } from "./_components/header/site-header-with-breadcrumb";

const modules = [
  {
    title: "Painel de Vendas",
    description: "Inicie novas vendas e acompanhe o fluxo de caixa.",
    href: "/dashboard/sales-dashboard",
    icon: Store,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50",
  },
  {
    title: "Orçamentos e Pedidos",
    description: "Gerencie pedidos, orçamentos e status de entrega.",
    href: "/dashboard/order/order-list",
    icon: ClipboardList,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "group-hover:border-amber-500/50",
  },
  {
    title: "Catálogo de Produtos",
    description: "Consulte estoque, preços e portfólio de produtos.",
    href: "/dashboard/product/catalog",
    icon: PackageSearch,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/50",
  },
  {
    title: "Lista de Clientes",
    description: "Acesse o cadastro e histórico completo de compras.",
    href: "/dashboard/customer/customer-list",
    icon: Users,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "group-hover:border-indigo-500/50",
  },
  {
    title: "Painel de Relatórios",
    description: "Visualize métricas, resultados, metas e comissões.",
    href: "/dashboard/report/panel",
    icon: BarChart3,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/50",
  },
  {
    title: "CRM",
    description: "Gestão de relacionamento e pipeline de vendas.",
    href: "/dashboard/crm/crm-panel",
    icon: Target,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "group-hover:border-rose-500/50",
  },
  {
    title: "Agenda",
    description: "Organize seus compromissos, visitas e retornos.",
    href: "/dashboard/agenda/agenda-panel",
    icon: CalendarDays,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "group-hover:border-sky-500/50",
  },
  {
    title: "Configurações",
    description: "Ajuste preferências e configurações da sua conta.",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "group-hover:border-slate-500/50",
  },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const { user } = session;
  const firstName = user?.name?.split(" ")[0] || "Vendedor";

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeaderWithBreadcrumb
        title="Início"
        breadcrumbItems={[{ label: "Início", isActive: true }]}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-2 pt-2 md:pt-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Bem-vindo ao seu painel. Selecione abaixo o módulo que deseja
            acessar para começar a trabalhar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl block h-full"
            >
              <Card
                className={`h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 bg-card/60 backdrop-blur-sm border-border/60 ${mod.borderColor} relative overflow-hidden flex flex-col`}
              >
                <CardHeader className="pb-3 flex-none">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-3 rounded-2xl ${mod.bgColor} ${mod.color} shadow-inner`}
                    >
                      <mod.icon className="w-6 h-6 md:w-7 md:h-7 stroke-[1.5]" />
                    </div>
                    <div className="bg-background/80 border border-border/50 rounded-full p-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-foreground/70" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 flex-grow flex flex-col justify-end pt-2">
                  <CardTitle className="text-lg md:text-[1.15rem] font-semibold text-foreground/90 transition-colors tracking-tight">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium opacity-85 leading-relaxed text-muted-foreground line-clamp-2">
                    {mod.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
