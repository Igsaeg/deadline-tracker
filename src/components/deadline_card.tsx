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
      <div className="mb-6">
        <h2 className="text-xl mb-1.5 line-clamp-1">{content.title}</h2>
        <p className="text-text-secondary line-clamp-1">
          {content.description}
        </p>
      </div>

      <div>
        <p>Due {content.parsedDueDate.monthName} {content.parsedDueDate.day}, {content.parsedDueDate.hour}:{content.parsedDueDate.minute}</p>
        {content.tags && (<div className="flex gap-1 flex-nowrap mt-2">
          {content.tags.map((tag) => (
            <p key={tag} className="badge_accent">{tag}</p>
          ))}
        </div>)}
      </div>
    </div>
  );
}