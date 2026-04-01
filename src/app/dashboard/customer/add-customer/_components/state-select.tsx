"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAZILIAN_STATES } from "@/lib/constants/brazilian-states";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function StateSelect({
  value,
  onChange,
  disabled,
  error,
}: StateSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="state" className="text-sm font-medium">
        Estado (UF)
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="state" className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent>
          {BRAZILIAN_STATES.map((state) => (
            <SelectItem key={state.code} value={state.code}>
              {state.code} - {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name="pe_state" value={value} />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
