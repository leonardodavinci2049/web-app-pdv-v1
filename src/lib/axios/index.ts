/**
 * Configuração principal do Axios para o projeto
 * Centraliza todas as configurações e exporta os clientes apropriados
 */

// Classes de erro personalizadas
export {
  ApiAuthenticationError,
  ApiConnectionError,
  ApiNotFoundError,
  ApiServerError,
  ApiValidationError,
  BaseApiService,
} from "./base-api-service";

export { default as serverAxiosClient } from "./server-axios-client";

/**
 * Guia de uso rápido:
 *
 * 1. Para Client Components:
 *    import { axiosClient } from '@/lib/axios';
 *    const response = await axiosClient.get('/endpoint');
 *
 * 2. Para Server Components/API Routes:
 *    import { serverAxiosClient } from '@/lib/axios';
 *    const response = await serverAxiosClient.get('/endpoint');
 *
 * 3. Para criar serviços:
 *    import { BaseApiService } from '@/lib/axios';
 *    class MyService extends BaseApiService {
 *      async getData() {
 *        return this.get('/my-endpoint');
 *      }
 *    }
 *
 * 4. Para usar hooks no React:
 *    import { useApiCall } from '@/hooks/use-api';
 *    const { data, loading, error, execute } = useApiCall();
 */
