"use client";

import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { envs } from "@/core/config/envs";

export default function CompanyFooter() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatar número do WhatsApp para link (remover caracteres especiais)
  const whatsappNumber = envs.NEXT_PUBLIC_COMPANY_WHATSAPP;
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-background/50 border-t">
      <div className="py-4 lg:py-4">
        {/* Layout responsivo: 1 coluna no mobile, 3 colunas centralizadas na tela */}
        <div className="mx-auto grid max-w-3xl gap-8 px-4 md:grid-cols-3 lg:gap-8">
          {/* Coluna 1: Logo, Nome da Empresa e WhatsApp */}
          <div className="flex flex-col items-start space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo/logo-footer.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <h3 className="text-foreground text-lg font-semibold">
                {envs.NEXT_PUBLIC_COMPANY_NAME}
              </h3>
            </div>

            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground flex items-center space-x-2 text-sm transition-colors hover:text-green-600"
            >
              <Phone className="h-4 w-4" />
              <span>{envs.NEXT_PUBLIC_COMPANY_PHONE}</span>
            </Link>
          </div>

          {/* Coluna 2: Menu de Navegação */}
          <div className="flex flex-col items-start space-y-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/sobre"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Sobre
              </Link>
              <Link
                href="/contato"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Contato
              </Link>
              <Link
                href="/privacidade"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privacidade
              </Link>
            </nav>
          </div>

          {/* Coluna 3: Desenvolvedor */}
          <div className="flex flex-col items-start space-y-4">
            <div>
              <p className="text-muted-foreground mb-3 text-xs">
                Sistema Desenvolvido Por:
              </p>
              <Link
                href={envs.NEXT_PUBLIC_DEVELOPER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col space-y-2 transition-opacity hover:opacity-80"
              >
                <Image
                  src={
                    mounted && resolvedTheme === "dark"
                      ? "/images/developer/logo-developer-dark.png"
                      : "/images/developer/logo-developer-light.png"
                  }
                  alt={envs.NEXT_PUBLIC_DEVELOPER_NAME}
                  width={120}
                  height={30}
                  className="h-6 w-auto transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright - também centralizados na tela */}
        <div className="mt-8 pt-6">
          <div className="mx-auto max-w-3xl px-4">
            <div className="border-t pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  © {new Date().getFullYear()} {envs.NEXT_PUBLIC_COMPANY_NAME}.
                  Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
