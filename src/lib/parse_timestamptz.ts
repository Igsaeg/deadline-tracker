type ParsedTimestampParts = {
  year: number;
  month: number;
  monthName: string;
  day: number;
  hour: number;
  minute: number;
};

export function parseTimestamp(timestampString: string): ParsedTimestampParts {
  const normalizedIsoString = timestampString
    .replace(" ", "T")
    .replace(/([+-]\d{2})$/, "$1:00");

  const parsedDate = new Date(normalizedIsoString);
  if (isNaN(parsedDate.getTime())) throw new Error(`Invalid timestamp: ${timestampString}`);

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(parsedDate);

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
    monthName,
    day: parsedDate.getDate(),
    hour: parsedDate.getHours(),
    minute: parsedDate.getMinutes(),
  };
}