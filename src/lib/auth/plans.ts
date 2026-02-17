/**
 * Configuração de planos de assinatura manual
 *
 * Este arquivo substitui a integração com Stripe,
 * definindo os planos disponíveis para assinatura manual.
 */

export interface SubscriptionPlan {
  name: string;
  displayName: string;
  price: number;
  currency: string;
  limits: {
    projects: number;
  };
  features: string[];
}

/**
 * Status possíveis para uma assinatura
 */
export const SUBSCRIPTION_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/**
 * Planos de assinatura disponíveis
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: "basic",
    displayName: "Basic",
    price: 9.99,
    currency: "BRL",
    limits: {
      projects: 3,
    },
    features: ["3 projetos", "Suporte por email", "Atualizações básicas"],
  },
  {
    name: "pro",
    displayName: "Pro",
    price: 29.99,
    currency: "BRL",
    limits: {
      projects: 10,
    },
    features: [
      "10 projetos",
      "Suporte prioritário",
      "Atualizações antecipadas",
      "API access",
    ],
  },
  {
    name: "enterprise",
    displayName: "Enterprise",
    price: 99.99,
    currency: "BRL",
    limits: {
      projects: -1, // ilimitado
    },
    features: [
      "Projetos ilimitados",
      "Suporte 24/7",
      "Todas as atualizações",
      "API access",
      "Customização",
    ],
  },
];

/**
 * Mapeamento de nome do plano para preço
 */
export const PLAN_TO_PRICE: Record<string, number> = SUBSCRIPTION_PLANS.reduce(
  (acc, plan) => {
    acc[plan.name] = plan.price;
    return acc;
  },
  {} as Record<string, number>,
);

/**
 * Encontra um plano pelo nome
 */
export function getPlanByName(name: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.name === name);
}

/**
 * Verifica se o status é ativo
 */
export function isSubscriptionActive(status: string): boolean {
  return status === SUBSCRIPTION_STATUS.ACTIVE;
}
