import { z } from "zod";

const envsSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PORT must be a positive number")),

  // APP URLs - Variáveis públicas da aplicação
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),

  // External APIs
  EXTERNAL_API_MAIN_URL: z
    .string()
    .url("EXTERNAL_API_MAIN_URL must be a valid URL"),
  EXTERNAL_API_ASSETS_URL: z
    .string()
    .url("EXTERNAL_API_ASSETS_URL must be a valid URL"),

  // SYSTEM
  APP_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("APP_ID must be a positive number")),
  SYSTEM_CLIENT_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("SYSTEM_CLIENT_ID must be a positive number")),
  STORE_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("STORE_ID must be a positive number")),
  ORGANIZATION_ID: z.string().min(1, "ORGANIZATION_ID is required"),
  MEMBER_ID: z.string().min(1, "MEMBER_ID is required"),
  USER_ID: z.string().min(1, "USER_ID is required"),
  PERSON_ID: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PERSON_ID must be a positive number")),
  TYPE_BUSINESS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("TYPE_BUSINESS must be a positive number")),

  // INFO DEVELOPER - Variáveis públicas do desenvolvedor (disponíveis no cliente)
  // Usadas para exibir informações de contato do desenvolvedor
  NEXT_PUBLIC_DEVELOPER_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_DEVELOPER_NAME is required"),
  NEXT_PUBLIC_DEVELOPER_URL: z
    .string()
    .url("NEXT_PUBLIC_DEVELOPER_URL must be a valid URL"),

  // INFO COMPANY - Variáveis públicas da empresa (disponíveis no cliente)
  // Usadas para exibir informações de contato da empresa
  NEXT_PUBLIC_COMPANY_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_COMPANY_NAME is required"),
  NEXT_PUBLIC_COMPANY_PHONE: z
    .string()
    .min(10, "NEXT_PUBLIC_COMPANY_PHONE must have at least 10 characters")
    .max(20, "NEXT_PUBLIC_COMPANY_PHONE must have at most 20 characters"),
  NEXT_PUBLIC_COMPANY_EMAIL: z
    .string()
    .email("NEXT_PUBLIC_COMPANY_EMAIL must be a valid email"),
  NEXT_PUBLIC_COMPANY_WHATSAPP: z
    .string()
    .min(10, "NEXT_PUBLIC_COMPANY_WHATSAPP must have at least 10 characters")
    .max(20, "NEXT_PUBLIC_COMPANY_WHATSAPP must have at most 20 characters"),

  // Database MySQL
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required"),
  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("DATABASE_PORT must be a positive number")),
  DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),
  DATABASE_USER: z.string().min(1, "DATABASE_USER is required"),
  DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required"),

  // Security - API Key
  API_KEY: z.string().min(1, "API_KEY is required"),

  // BETTER_AUTH
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),

  // OAuth
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Resend Email Configuration
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_SENDER_NAME: z.string().min(1, "EMAIL_SENDER_NAME is required"),
  EMAIL_SENDER_ADDRESS: z
    .string()
    .email("EMAIL_SENDER_ADDRESS must be a valid email"),
});

// Inferir o tipo automaticamente a partir do schema
type EnvVars = z.infer<typeof envsSchema>;

// Só executar validação no servidor, nunca no cliente
let envVars: EnvVars;

if (typeof window === "undefined") {
  // Estamos no servidor - fazer validação completa
  const validationResult = envsSchema.safeParse(process.env);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`❌ Invalid environment variables:\n${errorMessages}`);
  }

  envVars = validationResult.data;
} else {
  // Estamos no cliente - usar valores vazios ou default
  // Estas variáveis NÃO deve ser acessadas no cliente!
  envVars = {
    PORT: 0,
    NEXT_PUBLIC_APP_URL: "",
    EXTERNAL_API_MAIN_URL: "",
    EXTERNAL_API_ASSETS_URL: "",
    APP_ID: 0,
    SYSTEM_CLIENT_ID: 0,
    STORE_ID: 0,
    ORGANIZATION_ID: "",
    MEMBER_ID: "",
    USER_ID: "",
    PERSON_ID: 0,
    // Estas variáveis públicas PODEM ser acessadas no cliente
    NEXT_PUBLIC_DEVELOPER_NAME: process.env.NEXT_PUBLIC_DEVELOPER_NAME || "",
    NEXT_PUBLIC_DEVELOPER_URL: process.env.NEXT_PUBLIC_DEVELOPER_URL || "",

    // Informações da empresa - também disponíveis no cliente
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "",
    NEXT_PUBLIC_COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",
    NEXT_PUBLIC_COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "",
    NEXT_PUBLIC_COMPANY_WHATSAPP:
      process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || "",
    TYPE_BUSINESS: 0,
    DATABASE_URL: "",
    DATABASE_HOST: "",
    DATABASE_PORT: 0,
    DATABASE_NAME: "",
    DATABASE_USER: "",
    DATABASE_PASSWORD: "",
    API_KEY: "",
    BETTER_AUTH_URL: "",
    BETTER_AUTH_SECRET: "",
    GITHUB_CLIENT_ID: "",
    GITHUB_CLIENT_SECRET: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    RESEND_API_KEY: "",
    EMAIL_SENDER_NAME: "",
    EMAIL_SENDER_ADDRESS: "",
  };
}

export const envs = {
  PORT: envVars.PORT,
  NEXT_PUBLIC_APP_URL: envVars.NEXT_PUBLIC_APP_URL,
  EXTERNAL_API_MAIN_URL: envVars.EXTERNAL_API_MAIN_URL,
  EXTERNAL_API_ASSETS_URL: envVars.EXTERNAL_API_ASSETS_URL,
  APP_ID: envVars.APP_ID,
  SYSTEM_CLIENT_ID: envVars.SYSTEM_CLIENT_ID,
  STORE_ID: envVars.STORE_ID,
  ORGANIZATION_ID: envVars.ORGANIZATION_ID,
  MEMBER_ID: envVars.MEMBER_ID,
  USER_ID: envVars.USER_ID,
  PERSON_ID: envVars.PERSON_ID,
  TYPE_BUSINESS: envVars.TYPE_BUSINESS,
  // INFO DEVELOPER
  NEXT_PUBLIC_DEVELOPER_NAME: envVars.NEXT_PUBLIC_DEVELOPER_NAME,
  NEXT_PUBLIC_DEVELOPER_URL: envVars.NEXT_PUBLIC_DEVELOPER_URL,

  // INFO COMPANY
  NEXT_PUBLIC_COMPANY_NAME: envVars.NEXT_PUBLIC_COMPANY_NAME,
  NEXT_PUBLIC_COMPANY_PHONE: envVars.NEXT_PUBLIC_COMPANY_PHONE,
  NEXT_PUBLIC_COMPANY_EMAIL: envVars.NEXT_PUBLIC_COMPANY_EMAIL,
  NEXT_PUBLIC_COMPANY_WHATSAPP: envVars.NEXT_PUBLIC_COMPANY_WHATSAPP,

  DATABASE_URL: envVars.DATABASE_URL,
  DATABASE_HOST: envVars.DATABASE_HOST,
  DATABASE_PORT: envVars.DATABASE_PORT,
  DATABASE_NAME: envVars.DATABASE_NAME,
  DATABASE_USER: envVars.DATABASE_USER,
  DATABASE_PASSWORD: envVars.DATABASE_PASSWORD,
  API_KEY: envVars.API_KEY,
  BETTER_AUTH_URL: envVars.BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: envVars.BETTER_AUTH_SECRET,
  GITHUB_CLIENT_ID: envVars.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: envVars.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envVars.GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY: envVars.RESEND_API_KEY,
  EMAIL_SENDER_NAME: envVars.EMAIL_SENDER_NAME,
  EMAIL_SENDER_ADDRESS: envVars.EMAIL_SENDER_ADDRESS,
};
