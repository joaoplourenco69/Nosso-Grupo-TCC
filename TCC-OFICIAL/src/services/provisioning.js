import { supabase } from './supabase';
import { getSession } from './auth';

const FUNCTION_NAME = process.env.EXPO_PUBLIC_PROVISION_FUNCTION_NAME || 'provision-user';

export async function provisionUser({ nome, email, senha, cpf, perfil, idEmpresa }) {
  const session = await getSession();
  if (!session) {
    throw new Error('Você precisa estar logado como ADMIN para criar usuários. Entre com uma conta ADMIN e tente novamente.');
  }

  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { nome, email, senha, cpf, perfil, id_empresa: idEmpresa },
  });

  if (error) {
    let message = error.message || 'Não foi possível acessar o serviço de cadastro.';
    if (/unauthorized|401|autenticação|sessão/i.test(message)) {
      message = 'Sua sessão não está autorizada para criar usuários. Entre novamente com uma conta ADMIN.';
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
