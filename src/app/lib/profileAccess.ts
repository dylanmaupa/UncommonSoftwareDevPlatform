import { supabase } from '../../lib/supabase';

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export async function fetchProfileForAuthUser(user: AuthUserLike | null | undefined) {
  if (!user) return null;

  const attempts: Array<{ column: string; value: string }> = [];
  if (user.email) {
    attempts.push({ column: 'email', value: user.email });
  }
  attempts.push({ column: 'id', value: user.id });
  attempts.push({ column: 'user_id', value: user.id });

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq(attempt.column, attempt.value)
      .maybeSingle();

    if (!error && data) {
      return data as Record<string, unknown>;
    }
  }

  return null;
}

export async function updateProfileForAuthUser(
  user: AuthUserLike | null | undefined,
  patch: Record<string, unknown>
) {
  if (!user) {
    return { data: null, error: new Error('Missing user') };
  }

  const attempts: Array<{ column: string; value: string }> = [];
  if (user.email) {
    attempts.push({ column: 'email', value: user.email });
  }
  attempts.push({ column: 'id', value: user.id });
  attempts.push({ column: 'user_id', value: user.id });

  let lastError: unknown = null;

  for (const attempt of attempts) {
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq(attempt.column, attempt.value)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return { data: data as Record<string, unknown>, error: null };
    }

    if (error) {
      lastError = error;
    }
  }

  return { data: null, error: lastError };
}
