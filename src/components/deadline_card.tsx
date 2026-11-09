import { type Deadline } from "../lib/deadlines";

type DeadlineCardProps = {
  content: Deadline;
  onClick: () => void
};

export default function DeadlineCard({
  content,
  onClick
}: DeadlineCardProps) {
  return (
    <div
      className="surface_interactive transition_default p-6 flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="mb-5">
        <h2 className="text-xl mb-1 truncate">{content.title}</h2>
        <p className="text-text-secondary truncate">
          {content.description ? content.description : "No description."}
        </p>
      </div>

      <div>
        <p>
          Due {content.parsedDueDate.monthName} {content.parsedDueDate.day}, {content.parsedDueDate.hour}:{content.parsedDueDate.minute}
        </p>
        {content.tags.length > 0 && (<div className="flex gap-1 flex-nowrap mt-1.5">
          {content.tags.map((tag) => (
            <p key={tag} className="badge_accent">{tag}</p>
          ))}
        </div>)}
      </div>
    </div>
  );
}