
import { supabase } from "./supabase_client"

export async function signUpUser(
  email: string,
  password: string,
  displayName: string,
) {
  const { error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });

  if (authError) throw new Error(authError.message);
}

export async function signInUser(
  email: string,
  password: string,
) {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (authError) throw new Error(authError.message);
}

export async function signOutUser() {
  const { error: authError } = await supabase.auth.signOut()
  if (authError) throw new Error(authError.message);
}