"use client";

import { Loader2 } from "lucide-react";
import Form from "next/form";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
} | null;

interface BrandFormProps {
  mode: "create" | "update";
  action: (_prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: {
    brand_id?: number;
    brand?: string;
    image_path?: string;
    notes?: string;
    inactive?: number;
  };
  onSuccess?: () => void;
}

function SubmitButton({ mode }: { mode: "create" | "update" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {mode === "create" ? "Criar Marca" : "Salvar Alterações"}
    </Button>
  );
}

export function BrandForm({
  mode,
  action,
  initialData,
  onSuccess,
}: BrandFormProps) {
  const [state, formAction] = useActionState(action, null);
  const [inactive, setInactive] = useState(initialData?.inactive === 1);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccessRef.current?.();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Form action={formAction} className="space-y-4">
      {mode === "update" && initialData?.brand_id && (
        <input type="hidden" name="brand_id" value={initialData.brand_id} />
      )}

      <div className="space-y-2">
        <Label htmlFor="brand">Nome da Marca</Label>
        <Input
          id="brand"
          name="brand"
          placeholder="Ex: Nike, Samsung"
          defaultValue={initialData?.brand}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_path">URL da Imagem</Label>
        <Input
          id="image_path"
          name="image_path"
          placeholder="https://..."
          defaultValue={initialData?.image_path}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Anotações sobre a marca..."
          defaultValue={initialData?.notes}
        />
      </div>

      {mode === "update" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="inactive"
            checked={inactive}
            onCheckedChange={setInactive}
          />
          <Label htmlFor="inactive">Marca Inativa</Label>
          <input type="hidden" name="inactive" value={inactive ? "1" : "0"} />
        </div>
      )}

      <div className="pt-4">
        <SubmitButton mode={mode} />
      </div>
    </Form>
  );
}
