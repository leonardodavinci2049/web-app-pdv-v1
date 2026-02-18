"use client";

import Image from "next/image";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/dashboard">
            <div className=" text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src="/images/logo/logo-sidebar-white.png"
                alt="Logo da Empresa"
                width={32}
                height={32}
                className="size-8 object-contain"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {process.env.NEXT_PUBLIC_COMPANY_NAME || "Comsuporte"}
              </span>
              <span className="text-sidebar-foreground/70 truncate text-xs">
                PDV - Sistema de Vendas
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
