import { useEffect, useState } from "react";
import { parseDate } from "../lib/parse_timestamptz";
import { fetchDeadlines } from "../lib/supabase/deadlines";
import DeadlineCard from "../components/deadline_card";
import Skeleton from "../components/skeleton_loader";
import CreateDeadlineModal from "../components/create_deadline_modal";

type Deadline = {
  id: string;
  title: string;
  description: string;
  tags: string[],
  due_date: string;
  is_completed: boolean;
}

export default function Page() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isCreateDeadlineModalOpen, setIsCreateDeadlineModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDeadlines() {
      try {
        const data = await fetchDeadlines();
        if (!ignore) setDeadlines(data);
      } catch (error) {
        if (!ignore) setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadDeadlines();

    return () => { ignore = true; };
  }, []);

  function formatDate(date: string) {
    const { monthName, day, hour, minute } = parseDate(date);
    return `Due ${monthName} ${day} (${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")})`;
  }

  return (
    <div className="flex justify-center mx-6">
      <div className="w-5xl mt-24">
        <div className="mb-8">
          <div className="mb-8">
            <h1 className="text-4xl mb-2">Deadlines</h1>
            <p className="text-text-secondary text-lg">Hello.</p>
          </div>

          <div className="flex gap-2">
            <button
              className="button_accent"
              type="button"
              onClick={() => setIsCreateDeadlineModalOpen(true)}
            >New Deadline
            </button>
          </div>
        </div>

        <div className="divider_default mb-5"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {isLoading ? (
            <>
              <Skeleton variant="rounded" height={176} />
              <Skeleton variant="rounded" height={176} />
              <Skeleton variant="rounded" height={176} className="hidden lg:block" />
            </>
          ) : errorMessage ? (
            <p className="text-danger col-span-full">{errorMessage}. Try again later.</p>
          ) : deadlines.length === 0 ? (
            <p className="text-text-secondary col-span-full">No deadlines yet.</p>
          ) : (
            deadlines.map((task) => (
              <DeadlineCard
                key={task.id}
                title={task.title}
                description={task.description}
                tags={task.tags}
                due_date={formatDate(task.due_date)}
              />
            ))
          )}
        </div>
      </div>

      {isCreateDeadlineModalOpen && (
        <CreateDeadlineModal setIsCreateDeadlineModalOpen={setIsCreateDeadlineModalOpen} />
      )}
    </div>
  )
}