import {
  adminAc as orgAdminAc,
  memberAc as orgMemberAc,
  ownerAc as orgOwnerAc,
} from "better-auth/plugins/organization/access";
import { ac } from "./statements";

/**
 * ===========================================
 * Role: CUSTOMER (cliente da loja)
 * ===========================================
 *
 * Perfil para clientes que acessam o sistema.
 * Pode criar carrinho, orçamentos e acompanhar pedidos.
 *
 * Permissões herdadas do organization plugin:
 * - member: [] (sem permissões sobre membros)
 * - invitation: [] (sem permissões sobre convites)
 */
const customer = ac.newRole({
  ...orgMemberAc.statements,

  // PRODUTOS: apenas visualização do catálogo
  product: ["view"],
  category: ["view"],

  // PEDIDOS: visualizar seus próprios pedidos
  order: ["view"],

  // CARRINHO: acesso total ao seu carrinho
  cart: ["view", "create", "update", "delete", "checkout"],

  // ORÇAMENTOS: criar e visualizar seus orçamentos
  quote: ["view", "create", "update", "delete"],

  // CLIENTES: sem acesso
  customer: [],

  // RELATÓRIOS: sem acesso
  report: [],

  // CAIXA: sem acesso
  cashier: [],

  // PAGAMENTOS: sem acesso
  payment: [],

  // ESTOQUE: sem acesso
  stock: [],

  // FINANCEIRO: sem acesso
  finance: [],

  // EXPEDIÇÃO: sem acesso
  shipping: [],

  // CONFIGURAÇÕES: sem acesso
  settings: [],
});

/**
 * ===========================================
 * Role: SHIPPING (expedição/entregador)
 * ===========================================
 *
 * Perfil para funcionários de expedição e entrega.
 * Responsável por entregar mercadorias aos clientes.
 *
 * Permissões herdadas do organization plugin:
 * - member: [] (sem permissões sobre membros)
 * - invitation: [] (sem permissões sobre convites)
 */
const shippingRole = ac.newRole({
  ...orgMemberAc.statements,

  // PRODUTOS: visualização básica
  product: ["view"],
  category: ["view"],

  // PEDIDOS: visualizar pedidos para entrega
  order: ["view", "update-status"],

  // CLIENTES: visualizar dados para entrega
  customer: ["view", "view-details"],

  // EXPEDIÇÃO: permissões de entrega
  shipping: [
    "view-orders",
    "start-delivery",
    "complete-delivery",
    "return-delivery",
    "view-routes",
    "view-delivery-history",
  ],

  // RELATÓRIOS: apenas relatório de entregas
  report: ["view-shipping"],

  // CARRINHO: sem acesso
  cart: [],

  // ORÇAMENTOS: sem acesso
  quote: [],

  // CAIXA: sem acesso
  cashier: [],

  // PAGAMENTOS: sem acesso
  payment: [],

  // ESTOQUE: sem acesso
  stock: [],

  // FINANCEIRO: sem acesso
  finance: [],

  // CONFIGURAÇÕES: sem acesso
  settings: [],
});

/**
 * ===========================================
 * Role: FINANCE (financeiro)
 * ===========================================
 *
 * Perfil para funcionários do setor financeiro.
 * Responsável por contas a pagar/receber e fluxo de caixa.
 *
 * Permissões herdadas do organization plugin:
 * - member: [] (sem permissões sobre membros)
 * - invitation: [] (sem permissões sobre convites)
 */
const finance = ac.newRole({
  ...orgMemberAc.statements,

  // PRODUTOS: sem acesso
  product: [],
  category: [],

  // PEDIDOS: visualizar para conferência
  order: ["view", "view-all"],

  // CLIENTES: visualizar créditos/débitos
  customer: ["view", "view-details", "view-credit", "manage-credit"],

  // FINANCEIRO: acesso completo
  finance: [
    "view-accounts-payable",
    "view-accounts-receivable",
    "create-payable",
    "create-receivable",
    "pay-account",
    "receive-account",
    "view-cash-flow",
    "view-bank-accounts",
    "manage-bank-accounts",
    "reconcile",
  ],

  // RELATÓRIOS: relatórios financeiros
  report: ["view-financial", "view-sales-all", "view-customers", "export"],

  // CAIXA: visualização e histórico
  cashier: ["view", "view-history"],

  // CARRINHO: sem acesso
  cart: [],

  // ORÇAMENTOS: sem acesso
  quote: [],

  // PAGAMENTOS: sem acesso
  payment: [],

  // ESTOQUE: sem acesso
  stock: [],

  // EXPEDIÇÃO: sem acesso
  shipping: [],

  // CONFIGURAÇÕES: sem acesso
  settings: [],
});

/**
 * ===========================================
 * Role: CASHIER (caixa da loja)
 * ===========================================
 *
 * Perfil para operadores de caixa.
 * Foco em receber pagamentos e operar o caixa.
 *
 * Permissões herdadas do organization plugin:
 * - member: [] (sem permissões sobre membros)
 * - invitation: [] (sem permissões sobre convites)
 */
const cashierRole = ac.newRole({
  ...orgMemberAc.statements,

  // PRODUTOS: apenas visualização para consulta
  product: ["view"],
  category: ["view"],

  // PEDIDOS: visualizar para receber pagamento
  order: ["view", "view-all", "print"],

  // CLIENTES: consulta básica
  customer: ["view", "view-details"],

  // CAIXA: operação completa do caixa
  cashier: [
    "view",
    "open",
    "close",
    "withdraw",
    "deposit",
    "view-history",
    "receive-payment",
    "process-refund",
  ],

  // RELATÓRIOS: relatório do caixa
  report: ["view-sales"],

  // CARRINHO: sem acesso
  cart: [],

  // ORÇAMENTOS: sem acesso
  quote: [],

  // PAGAMENTOS: sem acesso (formas de pagamento)
  payment: ["view"],

  // ESTOQUE: sem acesso
  stock: [],

  // FINANCEIRO: sem acesso
  finance: [],

  // EXPEDIÇÃO: sem acesso
  shipping: [],

  // CONFIGURAÇÕES: sem acesso
  settings: [],
});

/**
 * ===========================================
 * Role: OPERATOR (operador)
 * ===========================================
 *
 * Perfil para operadores de cadastro e estoque.
 * Responsável por cadastrar produtos, dar entrada de mercadorias,
 * alimentar o estoque e definir preços.
 *
 * Permissões herdadas do organization plugin:
 * - member: [] (sem permissões sobre membros)
 * - invitation: [] (sem permissões sobre convites)
 */
const operator = ac.newRole({
  ...orgMemberAc.statements,

  // PRODUTOS: gerenciamento completo de cadastro
  product: [
    "view",
    "view-cost",
    "create",
    "update",
    "update-price",
    "update-stock",
    "import",
    "export",
  ],
  category: ["view", "create", "update"],

  // ESTOQUE: controle total do estoque
  stock: [
    "view",
    "view-details",
    "entry",
    "exit",
    "adjust",
    "transfer",
    "view-cost",
  ],

  // PEDIDOS: apenas visualização
  order: ["view"],

  // CLIENTES: sem acesso
  customer: [],

  // RELATÓRIOS: relatórios de produtos e estoque
  report: ["view-products", "view-stock", "export"],

  // CARRINHO: sem acesso
  cart: [],

  // ORÇAMENTOS: sem acesso
  quote: [],

  // CAIXA: sem acesso
  cashier: [],

  // PAGAMENTOS: sem acesso
  payment: [],

  // FINANCEIRO: sem acesso
  finance: [],

  // EXPEDIÇÃO: sem acesso
  shipping: [],

  // CONFIGURAÇÕES: sem acesso
  settings: [],
});

/**
 * ===========================================
 * Role: SALESPERSON (vendedor)
 * ===========================================
 *
 * Perfil para vendedores da loja.
 * Responsável por cadastrar clientes, criar pedidos e
 * acompanhar o status das vendas.
 *
 * Permissões herdadas do organization plugin:
 * - member: [] (sem permissões sobre membros)
 * - invitation: [] (sem permissões sobre convites)
 */
const salesperson = ac.newRole({
  ...orgMemberAc.statements,

  // PRODUTOS: apenas visualização para venda
  product: ["view"],
  category: ["view"],

  // PEDIDOS: criar e gerenciar suas vendas
  order: [
    "view",
    "create",
    "update",
    "update-status",
    "apply-discount",
    "print",
  ],

  // CLIENTES: cadastro e gerenciamento
  customer: ["view", "view-details", "create", "update"],

  // ORÇAMENTOS: criar e enviar orçamentos
  quote: ["view", "create", "update", "convert-to-order", "print", "send"],

  // RELATÓRIOS: apenas suas próprias vendas
  report: ["view-sales"],

  // CARRINHO: sem acesso
  cart: [],

  // CAIXA: apenas visualização
  cashier: ["view"],

  // PAGAMENTOS: sem acesso
  payment: [],

  // ESTOQUE: visualização básica
  stock: ["view"],

  // FINANCEIRO: sem acesso
  finance: [],

  // EXPEDIÇÃO: sem acesso
  shipping: [],

  // CONFIGURAÇÕES: sem acesso
  settings: [],
});

/**
 * ===========================================
 * Role: MANAGER (gerente - admin)
 * ===========================================
 *
 * Perfil para gerentes de loja com poderes administrativos.
 * Pode gerenciar usuários, produtos, preços, e configurações.
 *
 * Permissões herdadas do organization plugin:
 * - member: create, update (pode adicionar e atualizar membros)
 * - invitation: create, cancel (pode convidar e cancelar convites)
 * - organization: update (pode atualizar dados da organização)
 */
const manager = ac.newRole({
  ...orgAdminAc.statements,

  // PRODUTOS: gerenciamento completo exceto exclusão
  product: [
    "view",
    "view-cost",
    "create",
    "update",
    "update-price",
    "update-stock",
    "import",
    "export",
  ],
  category: ["view", "create", "update"],

  // ESTOQUE: controle total
  stock: [
    "view",
    "view-details",
    "entry",
    "exit",
    "adjust",
    "transfer",
    "view-cost",
  ],

  // PEDIDOS: controle total incluindo cancelamentos e descontos
  order: [
    "view",
    "view-all",
    "create",
    "update",
    "update-status",
    "cancel",
    "apply-discount",
    "reopen",
    "print",
  ],

  // CLIENTES: gerenciamento completo
  customer: [
    "view",
    "view-details",
    "create",
    "update",
    "view-credit",
    "manage-credit",
    "export",
  ],

  // ORÇAMENTOS: gerenciamento completo
  quote: [
    "view",
    "create",
    "update",
    "delete",
    "convert-to-order",
    "print",
    "send",
  ],

  // RELATÓRIOS: acesso a maioria dos relatórios
  report: [
    "view-sales",
    "view-sales-all",
    "view-products",
    "view-stock",
    "view-customers",
    "view-commission",
    "view-shipping",
    "export",
  ],

  // CAIXA: gerenciamento completo
  cashier: [
    "view",
    "open",
    "close",
    "withdraw",
    "deposit",
    "view-history",
    "receive-payment",
    "process-refund",
  ],

  // PAGAMENTOS: visualização de formas de pagamento
  payment: ["view"],

  // FINANCEIRO: visualização apenas
  finance: [
    "view-accounts-payable",
    "view-accounts-receivable",
    "view-cash-flow",
    "view-bank-accounts",
  ],

  // EXPEDIÇÃO: gerenciamento completo
  shipping: [
    "view-orders",
    "assign-delivery",
    "start-delivery",
    "complete-delivery",
    "return-delivery",
    "view-routes",
    "manage-routes",
    "view-delivery-history",
  ],

  // CARRINHO: sem acesso (para clientes)
  cart: [],

  // CONFIGURAÇÕES: visualização e gestão de usuários
  settings: ["view", "manage-users"],
});

/**
 * ===========================================
 * Role: OWNER (proprietário)
 * ===========================================
 *
 * Perfil com acesso total ao sistema da organização.
 * Pode fazer tudo que o gerente faz + exclusões e configurações avançadas.
 *
 * Permissões herdadas do organization plugin:
 * - member: create, update, delete (controle total sobre membros)
 * - invitation: create, cancel (controle total sobre convites)
 * - organization: update, delete (pode atualizar e deletar a organização)
 */
const owner = ac.newRole({
  ...orgOwnerAc.statements,

  // PRODUTOS: acesso total
  product: [
    "view",
    "view-cost",
    "create",
    "update",
    "update-price",
    "update-stock",
    "delete",
    "import",
    "export",
  ],
  category: ["view", "create", "update", "delete"],

  // ESTOQUE: controle total
  stock: [
    "view",
    "view-details",
    "entry",
    "exit",
    "adjust",
    "transfer",
    "view-cost",
  ],

  // PEDIDOS: acesso total incluindo descontos ilimitados
  order: [
    "view",
    "view-all",
    "create",
    "update",
    "update-status",
    "cancel",
    "apply-discount",
    "apply-discount-unlimited",
    "reopen",
    "print",
  ],

  // CLIENTES: acesso total
  customer: [
    "view",
    "view-details",
    "create",
    "update",
    "delete",
    "view-credit",
    "manage-credit",
    "export",
  ],

  // ORÇAMENTOS: acesso total
  quote: [
    "view",
    "create",
    "update",
    "delete",
    "convert-to-order",
    "print",
    "send",
  ],

  // RELATÓRIOS: acesso total incluindo financeiro
  report: [
    "view-sales",
    "view-sales-all",
    "view-products",
    "view-stock",
    "view-customers",
    "view-financial",
    "view-commission",
    "view-shipping",
    "export",
  ],

  // CAIXA: acesso total
  cashier: [
    "view",
    "open",
    "close",
    "withdraw",
    "deposit",
    "view-history",
    "receive-payment",
    "process-refund",
  ],

  // PAGAMENTOS: gerenciamento de formas de pagamento
  payment: ["view", "create", "update", "delete"],

  // FINANCEIRO: acesso total
  finance: [
    "view-accounts-payable",
    "view-accounts-receivable",
    "create-payable",
    "create-receivable",
    "pay-account",
    "receive-account",
    "view-cash-flow",
    "view-bank-accounts",
    "manage-bank-accounts",
    "reconcile",
  ],

  // EXPEDIÇÃO: acesso total
  shipping: [
    "view-orders",
    "assign-delivery",
    "start-delivery",
    "complete-delivery",
    "return-delivery",
    "view-routes",
    "manage-routes",
    "view-delivery-history",
  ],

  // CARRINHO: sem acesso (para clientes)
  cart: [],

  // CONFIGURAÇÕES: acesso total
  settings: [
    "view",
    "update",
    "manage-users",
    "manage-integrations",
    "manage-payment-methods",
    "manage-tax",
  ],
});

export {
  cashierRole as cashier,
  customer,
  finance,
  manager,
  operator,
  owner,
  salesperson,
  shippingRole as shipping,
};
