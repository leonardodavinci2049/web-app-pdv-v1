"use client";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map as MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
  user: {
    name: "Comsuporte",
    email: "mauro@comsuporte.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Caixa Fechada",
      logo: GalleryVerticalEnd,
      plan: "Distribuidora",
    },
    {
      name: "Mundial Megastore",
      logo: AudioWaveform,
      plan: "Enterprise",
    },
    {
      name: "Atacadão Eletrônico",
      logo: Command,
      plan: "Revenda",
    },
  ],
  navMain: [
    {
      title: "Consultor ",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Vendas",
          url: "/dashboard",
        },
        {
          title: "Orçamentos",
          url: "#",
        },
        {
          title: "Carrinho",
          url: "#",
        },
      ],
    },
    {
      title: "Produtos",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Catálogo",
          url: "#",
        },
        {
          title: "Novos Produtos",
          url: "#",
        },
        {
          title: "Mais vendidos",
          url: "#",
        },
      ],
    },
    {
      title: "Clientes",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Cadastros",
          url: "#",
        },

        {
          title: "Novo Cadastro",
          url: "#",
        },
      ],
    },

    {
      title: "Relatórios",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Resumo dos Pedidos",
          url: "/dashboard/report/panel",
        },
        {
          title: "Vendas",
          url: "/dashboard/report/sales",
        },
        {
          title: "Clientes",
          url: "/dashboard/report/customers",
        },
        {
          title: "Produtos",
          url: "/dashboard/report/products",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Pendências",
      url: "#",
      icon: Frame,
    },
    {
      name: "CRM",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: MapIcon,
    },
  ],
  admin: [
    {
      name: "Organização 1",
      url: "/dashboard/admin/organization1",
      icon: Frame,
    },
    {
      name: "Organização 2",
      url: "/dashboard/admin/organization1/caixa-fechada",
      icon: Frame,
    },
    {
      name: "Organização 3",
      url: "/dashboard/admin/organization2",
      icon: Frame,
    },
    {
      name: "Usuários",
      url: "/dashboard/admin/users",
      icon: PieChart,
    },

    {
      name: "Profile",
      url: "/dashboard/admin/profile",
      icon: PieChart,
    },
    {
      name: "Regras",
      url: "#",
      icon: MapIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavProjects projects={data.admin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
