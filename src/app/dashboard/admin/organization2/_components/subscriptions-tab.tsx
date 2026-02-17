"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPlanByName,
  isSubscriptionActive,
  PLAN_TO_PRICE,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
} from "@/lib/auth/plans";
import {
  createSubscription,
  getMySubscription,
  updateMySubscription,
} from "@/server/subscription";
import type { Subscription } from "@/services/db/auth/dto/auth.dto";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function SubscriptionsTab() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Carrega a assinatura do usuário
  useEffect(() => {
    async function loadSubscription() {
      setIsLoading(true);
      const result = await getMySubscription();

      if (result.success && result.data) {
        setSubscription(result.data);
      } else {
        setSubscription(null);
      }
      setIsLoading(false);
    }

    loadSubscription();
  }, []);

  const activePlan = subscription
    ? getPlanByName(subscription.plan)
    : undefined;

  const isActive = subscription
    ? isSubscriptionActive(subscription.status)
    : false;

  async function handleCancelSubscription() {
    if (!subscription) {
      toast.error("Nenhuma assinatura ativa");
      return;
    }

    startTransition(async () => {
      const result = await updateMySubscription({
        status: SUBSCRIPTION_STATUS.CANCELLED,
      });

      if (result.success) {
        setSubscription((prev) =>
          prev ? { ...prev, status: SUBSCRIPTION_STATUS.CANCELLED } : null,
        );
        toast.success("Assinatura cancelada com sucesso");
      } else {
        toast.error(result.error || "Erro ao cancelar assinatura");
      }
    });
  }

  async function handleSubscriptionChange(planName: string) {
    startTransition(async () => {
      if (subscription) {
        // Atualiza assinatura existente
        const result = await updateMySubscription({
          plan: planName,
          status: SUBSCRIPTION_STATUS.ACTIVE,
        });

        if (result.success) {
          setSubscription((prev) =>
            prev
              ? { ...prev, plan: planName, status: SUBSCRIPTION_STATUS.ACTIVE }
              : null,
          );
          toast.success("Plano atualizado com sucesso");
        } else {
          toast.error(result.error || "Erro ao atualizar plano");
        }
      } else {
        // Cria nova assinatura
        const result = await createSubscription({
          plan: planName,
          status: SUBSCRIPTION_STATUS.ACTIVE,
        });

        if (result.success && result.data) {
          setSubscription(result.data);
          toast.success("Assinatura criada com sucesso");
        } else {
          toast.error(result.error || "Erro ao criar assinatura");
        }
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscription && isActive && activePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Assinatura Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">
                    Plano {activePlan.displayName}
                  </h3>
                  <Badge variant="secondary">
                    {currencyFormatter.format(PLAN_TO_PRICE[subscription.plan])}
                    /mês
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activePlan.limits.projects === -1
                    ? "Projetos ilimitados"
                    : `${activePlan.limits.projects} projetos incluídos`}
                </p>
                {subscription.approvedAt && (
                  <p className="text-sm text-muted-foreground">
                    Ativo desde{" "}
                    {new Date(subscription.approvedAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                )}
              </div>
              <Badge
                variant={isActive ? "default" : "destructive"}
                className="capitalize"
              >
                {subscription.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription && !isActive && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="text-yellow-700">
              Assinatura Inativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sua assinatura está com status:{" "}
              <strong className="capitalize">{subscription.status}</strong>.
              Selecione um plano abaixo para reativar.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.name && isActive;

          return (
            <Card
              key={plan.name}
              className={`relative ${isCurrentPlan ? "border-primary" : ""}`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default">Plano Atual</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl capitalize">
                    {plan.displayName}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {currencyFormatter.format(plan.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">por mês</div>
                  </div>
                </div>
                <CardDescription>
                  {plan.limits.projects === -1
                    ? "Projetos ilimitados"
                    : `Até ${plan.limits.projects} projetos`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-sm space-y-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={`${plan.name}-feature-${index}`}
                      className="flex items-center gap-2"
                    >
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelSubscription}
                    disabled={isPending}
                  >
                    {isPending ? "Cancelando..." : "Cancelar Assinatura"}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscriptionChange(plan.name)}
                    disabled={isPending}
                  >
                    {isPending
                      ? "Processando..."
                      : subscription && isActive
                        ? "Trocar para este plano"
                        : "Assinar"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
