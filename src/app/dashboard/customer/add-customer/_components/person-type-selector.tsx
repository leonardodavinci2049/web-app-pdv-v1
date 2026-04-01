"use client";

import { Building2, User } from "lucide-react";

export type PersonType = "fisica" | "juridica";

interface PersonTypeSelectorProps {
  value: PersonType;
  onChange: (type: PersonType) => void;
  disabled?: boolean;
}

export function PersonTypeSelector({
  value,
  onChange,
  disabled,
}: PersonTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("fisica")}
        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
          value === "fisica"
            ? "border-primary bg-primary/5 ring-primary/20 ring-2"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
        } ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            value === "fisica"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Pessoa Física</p>
          <p className="text-muted-foreground text-xs">CPF</p>
        </div>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("juridica")}
        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
          value === "juridica"
            ? "border-primary bg-primary/5 ring-primary/20 ring-2"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
        } ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            value === "juridica"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Pessoa Jurídica</p>
          <p className="text-muted-foreground text-xs">CNPJ</p>
        </div>
      </button>
    </div>
  );
}
