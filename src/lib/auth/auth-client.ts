import {
  adminClient,
  lastLoginMethodClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  ac,
  cashier,
  customer,
  finance,
  manager,
  operator,
  owner,
  salesperson,
  shipping,
  superAdmin,
  user,
} from "./permissions";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        manager,
        salesperson,
        operator,
        cashier,
        finance,
        shipping,
        customer,
      },
    }),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/auth/2fa";
      },
    }),
    adminClient({
      ac,
      roles: {
        admin: superAdmin,
        user,
      },
    }),
    lastLoginMethodClient(),
  ],
});
