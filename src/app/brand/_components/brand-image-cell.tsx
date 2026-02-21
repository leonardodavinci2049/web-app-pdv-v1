"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/brand/no-image.png";

interface BrandImageCellProps {
  imagePath?: string;
  brandName: string;
}

export function BrandImageCell({ imagePath, brandName }: BrandImageCellProps) {
  const [src, setSrc] = useState(imagePath || FALLBACK_IMAGE);

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
      <Image
        src={src}
        alt={brandName}
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
        onError={() => setSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}
