
import { supabase } from "./supabase_client"

export async function signUp(
  email: string,
  password: string,
  displayName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });

  if (error) throw new Error(error.message);
}

export async function logIn(
  email: string,
  password: string,
) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw new Error(error.message);
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message);
}