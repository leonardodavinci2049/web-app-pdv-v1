import "server-only";

import {
  createPool,
  type Pool,
  type PoolConnection,
  type PoolOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { z } from "zod";
import { envs } from "@/core/config/envs";
import { createLogger } from "@/core/logger";

const logger = createLogger("database-service");

// Pool configuration with safe defaults - can be overridden via environment variables:
// DB_POOL_CONNECTION_LIMIT, DB_POOL_MAX_IDLE, DB_POOL_IDLE_TIMEOUT, DB_POOL_QUEUE_LIMIT
const poolConfigSchema = z.object({
  connectionLimit: z.coerce.number().positive().default(5),
  maxIdle: z.coerce.number().nonnegative().default(2),
  idleTimeout: z.coerce.number().positive().default(10000),
  queueLimit: z.coerce.number().nonnegative().default(50),
});

// Only positional parameters are supported (namedPlaceholders not enabled in pool config)
type SqlParam =
  | string
  | number
  | bigint
  | boolean
  | Date
  | null
  | Buffer
  | Uint8Array;
export type QueryParams = SqlParam[];

// Error for connection-level failures
export class ErroConexaoBancoDados extends Error {
  constructor(
    mensagem: string,
    public readonly erroOriginal: Error,
  ) {
    super(mensagem);
    this.name = "ErroConexaoBancoDados";
  }
}

// Operation classification for query errors
export type OperacaoConsulta =
  | "select"
  | "modify"
  | "transaction"
  | "connection";

// Error for query execution failures - stores sanitized metadata instead of raw SQL
export class ErroExecucaoConsulta extends Error {
  constructor(
    mensagem: string,
    public readonly operacao: OperacaoConsulta,
    public readonly durationMs: number,
    public readonly erroOriginal: Error,
  ) {
    super(mensagem);
    this.name = "ErroExecucaoConsulta";
  }
}

// Transactional context interface - decouples callers from PoolConnection internals
export interface TransactionContext {
  execute<T extends RowDataPacket>(
    queryString: string,
    params?: QueryParams,
  ): Promise<T[]>;
  modify(queryString: string, params?: QueryParams): Promise<ResultSetHeader>;
}

class DatabaseService {
  private poolConnection: Pool | null = null;

  private constructor() {}

  // Singleton via globalThis - survives module re-evaluation in dev mode
  public static getInstance(): DatabaseService {
    const globalKey = "__db_service_instance__" as const;
    const g = globalThis as typeof globalThis & {
      [K in typeof globalKey]?: DatabaseService;
    };
    if (!g[globalKey]) {
      g[globalKey] = new DatabaseService();
    }
    return g[globalKey];
  }

  // Creates the connection pool (idempotent)
  public connect(): void {
    if (this.poolConnection) {
      logger.debug("Pool de conexões já está ativo");
      return;
    }

    try {
      const poolConfig = poolConfigSchema.parse({
        connectionLimit: process.env.DB_POOL_CONNECTION_LIMIT,
        maxIdle: process.env.DB_POOL_MAX_IDLE,
        idleTimeout: process.env.DB_POOL_IDLE_TIMEOUT,
        queueLimit: process.env.DB_POOL_QUEUE_LIMIT,
      });

      const config: PoolOptions = {
        host: envs.DATABASE_HOST,
        port: envs.DATABASE_PORT,
        database: envs.DATABASE_NAME,
        user: envs.DATABASE_USER,
        password: envs.DATABASE_PASSWORD,
        waitForConnections: true,
        connectionLimit: poolConfig.connectionLimit,
        maxIdle: poolConfig.maxIdle,
        idleTimeout: poolConfig.idleTimeout,
        enableKeepAlive: true,
        keepAliveInitialDelay: 5000,
        queueLimit: poolConfig.queueLimit,
      };

      this.poolConnection = createPool(config);
      logger.info("Pool de conexões MySQL criado");
    } catch (error) {
      logger.error("Falha ao criar pool de conexões MySQL", error);
      throw new ErroConexaoBancoDados(
        "Falha ao estabelecer conexão com o banco de dados",
        error as Error,
      );
    }
  }

  // Lazy initialization - pool is created on first use
  private ensureConnection(): Pool {
    if (!this.poolConnection) {
      this.connect();
    }
    if (!this.poolConnection) {
      throw new ErroConexaoBancoDados(
        "Não foi possível estabelecer conexão com o banco de dados",
        new Error("Pool connection is null"),
      );
    }
    return this.poolConnection;
  }

  // SELECT using query (flexible)
  async selectQuery<T extends RowDataPacket>(
    queryString: string,
    params?: QueryParams,
  ): Promise<T[]> {
    const start = Date.now();
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.query<T[]>(queryString, params);
      logger.debug("selectQuery concluído", { durationMs: Date.now() - start });
      return results;
    } catch (error) {
      const durationMs = Date.now() - start;
      logger.error("Falha em selectQuery", { durationMs });
      throw new ErroExecucaoConsulta(
        "Falha ao executar consulta SELECT",
        "select",
        durationMs,
        error as Error,
      );
    }
  }

  // SELECT using prepared statement (recommended - prevents SQL injection)
  async selectExecute<T extends RowDataPacket>(
    queryString: string,
    params?: QueryParams,
  ): Promise<T[]> {
    const start = Date.now();
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.execute<T[]>(queryString, params);
      logger.debug("selectExecute concluído", {
        durationMs: Date.now() - start,
      });
      return results;
    } catch (error) {
      const durationMs = Date.now() - start;
      logger.error("Falha em selectExecute", { durationMs });
      throw new ErroExecucaoConsulta(
        "Falha ao executar consulta SELECT com execute",
        "select",
        durationMs,
        error as Error,
      );
    }
  }

  // INSERT/UPDATE/DELETE using prepared statement (recommended)
  async modifyExecute(
    queryString: string,
    params?: QueryParams,
  ): Promise<ResultSetHeader> {
    const start = Date.now();
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.execute(queryString, params);
      logger.debug("modifyExecute concluído", {
        durationMs: Date.now() - start,
      });
      return results as ResultSetHeader;
    } catch (error) {
      const durationMs = Date.now() - start;
      logger.error("Falha em modifyExecute", { durationMs });
      throw new ErroExecucaoConsulta(
        "Falha ao executar operação de modificação com execute",
        "modify",
        durationMs,
        error as Error,
      );
    }
  }

  /** @deprecated Use modifyExecute instead */
  async ModifyExecute(
    queryString: string,
    params?: QueryParams,
  ): Promise<ResultSetHeader> {
    return this.modifyExecute(queryString, params);
  }

  // INSERT/UPDATE/DELETE using query
  async modifyQuery(
    queryString: string,
    params?: QueryParams,
  ): Promise<ResultSetHeader> {
    const start = Date.now();
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.query(queryString, params);
      logger.debug("modifyQuery concluído", { durationMs: Date.now() - start });
      return results as ResultSetHeader;
    } catch (error) {
      const durationMs = Date.now() - start;
      logger.error("Falha em modifyQuery", { durationMs });
      throw new ErroExecucaoConsulta(
        "Falha ao executar operação de modificação com query",
        "modify",
        durationMs,
        error as Error,
      );
    }
  }

  /** @deprecated Use modifyQuery instead */
  async ModifyQuery(
    queryString: string,
    params?: QueryParams,
  ): Promise<ResultSetHeader> {
    return this.modifyQuery(queryString, params);
  }

  // Runs a callback within a database transaction
  async runInTransaction<T>(
    callback: (ctx: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const connection = await this.getConnection();
    const start = Date.now();

    const ctx: TransactionContext = {
      async execute<R extends RowDataPacket>(
        queryString: string,
        params?: QueryParams,
      ): Promise<R[]> {
        const [results] = await connection.execute<R[]>(queryString, params);
        return results;
      },
      async modify(
        queryString: string,
        params?: QueryParams,
      ): Promise<ResultSetHeader> {
        const [results] = await connection.execute(queryString, params);
        return results as ResultSetHeader;
      },
    };

    try {
      await connection.beginTransaction();
      const result = await callback(ctx);
      await connection.commit();
      logger.debug("Transação concluída com sucesso", {
        durationMs: Date.now() - start,
      });
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error("Transação revertida", { durationMs: Date.now() - start });
      throw error;
    } finally {
      connection.release();
    }
  }

  // Low-level pool connection (prefer runInTransaction for transactional operations)
  async getConnection(): Promise<PoolConnection> {
    try {
      const pool = this.ensureConnection();
      return await pool.getConnection();
    } catch (error) {
      logger.error("Falha ao obter conexão do pool", error);
      throw new ErroConexaoBancoDados(
        "Falha ao obter conexão do pool",
        error as Error,
      );
    }
  }

  // Explicit connectivity health check
  async ping(): Promise<void> {
    const connection = await this.getConnection();
    try {
      await connection.ping();
      logger.debug("Ping ao banco de dados bem-sucedido");
    } finally {
      connection.release();
    }
  }

  // Graceful pool shutdown
  async closeConnection(): Promise<void> {
    if (this.poolConnection) {
      await this.poolConnection.end();
      this.poolConnection = null;
      logger.info("Pool de conexões MySQL encerrado");
    }
  }
}

// Singleton instance - pool is created lazily on first use, no side effects on import
const dbService = DatabaseService.getInstance();

export default dbService;
export { DatabaseService };
