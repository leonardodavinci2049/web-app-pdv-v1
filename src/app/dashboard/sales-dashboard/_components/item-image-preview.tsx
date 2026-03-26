"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ItemImagePreviewProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

export function ItemImagePreview({
  src,
  alt,
  children,
}: ItemImagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="cursor-zoom-in rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[92vw] border-0 bg-transparent p-0 shadow-none sm:max-w-md"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative overflow-hidden rounded-2xl bg-background shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition hover:bg-background"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
            <Image
              src={src}
              alt={alt}
              width={600}
              height={600}
              className="h-auto w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
