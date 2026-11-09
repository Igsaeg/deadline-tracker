import { useEffect, useRef, useState } from "react";
import { fetchDeadlines, type Deadline } from "../lib/deadlines";
import { useAuthSession } from "../app/App";
import DeadlineCard from "../components/deadline_card";
import Skeleton from "../components/skeleton_loader";
import CreateDeadlineModal from "../components/create_deadline_modal";
import DeadlineModal from "../components/deadline_modal";

export default function HomePage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const currentDeadlineModalContent = useRef<Deadline | null>(null);
  
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isCreateDeadlineModalOpen, setIsCreateDeadlineModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshCounter, setRefreshCounter] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const session = useAuthSession();

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
            parsedDueDate: deadline.parsed_due_date,
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

  return (
    <div className="flex justify-center mx-6">
      <div className="w-5xl mt-28">
        <div>
          <div className="mb-12">
            <h1 className="text-4xl mb-2.5">Welcome back, {session?.user.user_metadata.display_name}.</h1>
            <p className="text-text-secondary text-lg">
              Let's keep your priorities on track.
            </p>
          </div>

          <button
            className="button_accent"
            type="button"
            onClick={() => setIsCreateDeadlineModalOpen(true)}
          >New Deadline
          </button>
        </div>

        <div className="divider_default mt-8 mb-6"></div>

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
                content={deadline}
                onClick={() => {
                  currentDeadlineModalContent.current = deadline;
                  setIsDeadlineModalOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {currentDeadlineModalContent.current && (
        <DeadlineModal
          content={currentDeadlineModalContent.current}
          isOpen={isDeadlineModalOpen}
          onClose={() => setIsDeadlineModalOpen(false)}
        />
      )}

      <CreateDeadlineModal
        isOpen={isCreateDeadlineModalOpen}
        onClose={() => setIsCreateDeadlineModalOpen(false)}
        onDeadlinesChanged={() => setRefreshCounter((previousCount) => previousCount + 1)}
      />
    </div>
  )
}