import { useEffect, useState } from "react";
import { parseTimestamp } from "../lib/parse_timestamptz";
import { fetchDeadlines } from "../lib/supabase/deadlines";
import DeadlineCard from "../components/deadline_card";
import Skeleton from "../components/skeleton_loader";
import CreateDeadlineModal from "../components/create_deadline_modal";

type Deadline = {
  id: string;
  title: string;
  description: string;
  tags: string[],
  dueDate: string;
  isCompleted: boolean;
}

export default function HomePage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isCreateDeadlineModalOpen, setIsCreateDeadlineModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function loadDeadlines() {
      try {
        const fetchedDeadlines = await fetchDeadlines();
        if (!isCancelled) {
          setDeadlines(fetchedDeadlines.map((deadline) => ({
            id: deadline.id,
            title: deadline.title,
            description: deadline.description,
            tags: deadline.tags,
            dueDate: deadline.due_date,
            isCompleted: deadline.is_completed,
          })));
        }
      } catch (loadError) {
        if (!isCancelled) setErrorMessage(loadError instanceof Error ? loadError.message : "An unexpected error occurred.");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    void loadDeadlines();

    return () => { isCancelled = true; };
  }, [refreshCounter]);

  function formatDueDate(timestamp: string) {
    const { monthName, day, hour, minute } = parseTimestamp(timestamp);
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
            deadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                title={deadline.title}
                description={deadline.description}
                tags={deadline.tags}
                dueDate={formatDueDate(deadline.dueDate)}
              />
            ))
          )}
        </div>
      </div>

      <CreateDeadlineModal
        isOpen={isCreateDeadlineModalOpen}
        onClose={() => setIsCreateDeadlineModalOpen(false)}
        onDeadlinesChanged={() => setRefreshCounter((previousCount) => previousCount + 1)}
      />
    </div>
  )
}