import { supabase } from './supabase';

const OCORRENCIA_SELECT = `
  *,
  area_monitorada:area_id(nome, latitude, longitude),
  camera:camera_id(nome, latitude, longitude),
  equipe_brigadista:equipe_id(nome)
`;

export async function listarOcorrenciasDoPerfil(profile) {
  let query = supabase
    .from('ocorrencia')
    .select(OCORRENCIA_SELECT)
    .order('criado_em', { ascending: false });

  if (profile?.perfil === 'FUNCIONARIO') {
    query = query.eq('empresa_id', profile.empresa_id);
  }

  if (profile?.perfil === 'BRIGADISTA') {
    query = query.eq('empresa_id', profile.empresa_id).not('equipe_id', 'is', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function assinarOcorrencias(profile, onChange) {
  const channel = supabase
    .channel(`ocorrencias-${profile?.empresa_id || 'admin'}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ocorrencia',
        filter: profile?.empresa_id ? `empresa_id=eq.${profile.empresa_id}` : undefined,
      },
      onChange
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function atualizarStatusOcorrencia({ ocorrencia, novoStatus, observacao, userId }) {
  const statusAnterior = ocorrencia.status;

  const { data, error } = await supabase
    .from('ocorrencia')
    .update({ status: novoStatus, atualizado_em: new Date().toISOString() })
    .eq('id', ocorrencia.id)
    .select()
    .single();

  if (error) throw error;

  const { error: historicoError } = await supabase.from('ocorrencia_historico').insert({
    ocorrencia_id: ocorrencia.id,
    usuario_id: userId,
    status_anterior: statusAnterior,
    status_novo: novoStatus,
    observacao,
  });

  if (historicoError) throw historicoError;

  return data;
}
