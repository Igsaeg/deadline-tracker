import { supabase } from "./supabase_client"

export type Deadline = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate: string;
  parsedDueDate: ParsedTimestampParts
  isCompleted: boolean;
}

type ParsedTimestampParts = {
  year: number;
  month: number;
  monthName: string;
  day: number;
  hour: string;
  minute: string;
};

export function parseTimestamp(timestampString: string): ParsedTimestampParts {
  const normalizedIsoString = timestampString
    .replace(" ", "T")
    .replace(/([+-]\d{2})$/, "$1:00");

  const parsedDate = new Date(normalizedIsoString);

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
    monthName: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(parsedDate),
    day: parsedDate.getDate(),
    hour: String(parsedDate.getHours()).padStart(2, "0"),
    minute: String(parsedDate.getMinutes()).padStart(2, "0"),
  };
}

export async function createDeadline(
  title: string,
  description: string,
  tags: string[],
  dueDate: string,
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
  return data.map(deadline => ({ ...deadline, parsed_due_date: parseTimestamp(deadline.due_date) }))
}