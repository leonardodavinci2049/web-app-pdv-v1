"use client";

import Image from "next/image";
import Link from "next/link";

import { useOrganizationMeta } from "@/components/common/organization-meta-provider";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const FALLBACK_LOGO_SRC = "/images/logo/logo-sidebar.png";

function resolveLogoSrc(
  imageBaseUrl: string,
  logoPath: string | null | undefined,
) {
  if (!logoPath) {
    return FALLBACK_LOGO_SRC;
  }

  const trimmedPath = logoPath.trim();

  if (!trimmedPath) {
    return FALLBACK_LOGO_SRC;
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }

  try {
    return new URL(trimmedPath, imageBaseUrl).toString();
  } catch {
    return FALLBACK_LOGO_SRC;
  }
}

export function SidebarLogo() {
  const { setOpenMobile } = useSidebar();
  const { meta, imageBaseUrl } = useOrganizationMeta();

  const logoSrc = resolveLogoSrc(imageBaseUrl, meta.IMAGE1);

  const isExternalUrl = logoSrc.startsWith("http");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="h-auto! py-3!" asChild>
          <Link
            href="/dashboard"
            onClick={() => setOpenMobile(false)}
            className="flex-col! items-start! gap-2!"
          >
            <Image
              src={logoSrc}
              alt="Logo da Empresa"
              width={280}
              height={80}
              unoptimized={isExternalUrl}
              className="max-h-10 w-full max-w-full object-contain object-left"
            />
            <span className="text-sidebar-foreground/70 truncate text-xs">
              PDV - Sistema de Vendas
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
