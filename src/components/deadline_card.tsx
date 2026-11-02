type DeadlineCard = {
  title: string
  description: string;
  tags: string[],
  due_date: string;
};

export default function DeadlineCard({
  title,
  description,
  tags,
  due_date,
}: DeadlineCard) {
  return (
    <div
      className="surface_interactive transition_default p-5 flex flex-col justify-between"
      onClick={() => console.log(title)}
    >
      <div className="mb-5">
        <h2 className="text-xl mb-1.5 line-clamp-1">{title}</h2>
        <p className="text-text-secondary line-clamp-1">
          {description ? description : "No description."}
        </p>
      </div>

      <div>
        <p className="mb-2">{due_date}</p>
        <div className="flex gap-1 flex-nowrap">
          {tags.map((tag) => (
              <p key={tag} className="badge_accent w-fit line-clamp-1">{tag}</p>
          ))}
        </div>
      </div>
    </div>
  );
}