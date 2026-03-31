"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CustomerSearch({
  value,
  onChange,
  disabled = false,
}: CustomerSearchProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">ID do cliente</Label>
      <Input
        id="customerId"
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="Buscar por ID do cliente..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
