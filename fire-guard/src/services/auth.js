import { supabase } from './supabase';

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;

  const profile = await getCurrentUserProfile(data.user?.id);
  return { session: data.session, user: data.user, profile };
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUserProfile(userId) {
  const id = userId || (await supabase.auth.getUser()).data.user?.id;

  if (!id) return null;

  const { data, error } = await supabase
    .from('usuario')
    .select('id, nome, email, perfil, empresa_id')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
