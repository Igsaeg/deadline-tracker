import { supabase } from "./supabase_client"

export async function createDeadline(
  title: string,
  description: string,
  tags: string[],
  dueDate: string
) {
  const { error } = await supabase
    .from("deadlines")
    .insert({ title, description, tags, due_date: dueDate, is_completed: false });

  if (error) throw error;
}

export async function fetchDeadlines() {
  const { data, error } = await supabase
    .from("deadlines")
    .select("id, title, description, tags, due_date, is_completed");

  if (error)  throw new Error(error.message);
  return data;
}