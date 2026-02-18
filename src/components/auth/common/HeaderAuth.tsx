"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import Logo from "@/components/logo";
import ModeToggle from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";

export default function HeaderAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Suspense>
            <ModeToggle />
          </Suspense>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10 lg:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="bg-background border-t lg:hidden">
          <nav className="container space-y-2 px-4 py-4 sm:px-6">
            <a
              href="/about"
              className="hover:text-primary block py-2 text-sm font-medium transition-colors"
              onClick={toggleMenu}
            >
              Sobre
            </a>
            <a
              href="/privacy"
              className="hover:text-primary block py-2 text-sm font-medium transition-colors"
              onClick={toggleMenu}
            >
              Privacidade
            </a>
            <a
              href="/terms"
              className="hover:text-primary block py-2 text-sm font-medium transition-colors"
              onClick={toggleMenu}
            >
              Termos
            </a>
            <a
              href="/contact"
              className="hover:text-primary block py-2 text-sm font-medium transition-colors"
              onClick={toggleMenu}
            >
              Contato
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
