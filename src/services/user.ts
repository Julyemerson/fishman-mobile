import api from '@/services/api';
import { User, useAuthStore } from '@/store/auth.store';

/**
 * Busca o usuário logado (com o papel) e guarda na sessão. Roda ao entrar na
 * área logada — inclusive em sessões salvas de antes do papel existir.
 * Falha em silêncio: sem o papel, o app só não mostra as telas de admin.
 */
export async function loadCurrentUser(): Promise<void> {
  try {
    const { data } = await api.get<User>('/auth/me');
    useAuthStore.getState().setUser(data);
  } catch {
    // sem rede ou token vencido (o interceptor da api já cuida do logout)
  }
}
