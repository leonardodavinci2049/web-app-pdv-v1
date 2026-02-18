import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center space-x-3">
      <Image
        src="/images/logo/logo-header.png"
        alt={`${process.env.NEXT_PUBLIC_COMPANY_NAME || "Logo"} Logo`}
        width={48}
        height={48}
        className="h-10 w-10 sm:h-12 sm:w-12"
      />
      <div className="flex flex-col">
        <span className="text-lg font-bold sm:text-xl">
          {process.env.NEXT_PUBLIC_COMPANY_NAME}
        </span>
        <span className="text-muted-foreground text-xs sm:text-sm">
          Painel Administrativo
        </span>
      </div>
    </div>
  );
}
