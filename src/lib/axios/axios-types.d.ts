import "axios";

/**
 * Extensão do tipo InternalAxiosRequestConfig para incluir metadata
 */
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
      retryCount?: number;
    };
  }
}
