import { useEffect, useRef } from "react"
import { type Deadline } from "../lib/deadlines";

type DeadlineModalProps = {
  content: Deadline;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeadlineModal({
  content,
  isOpen,
  onClose
}: DeadlineModalProps) {
  const dialogElementRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogElementRef.current;
    if (isOpen) {
      if (dialog && !dialog.open) dialog.showModal();
    } else {
      if (dialog?.open) dialog.close();
    }

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [isOpen]);

  function closeModal() {
    const dialog = dialogElementRef.current;
    if (dialog?.open) dialog.close();
    onClose();
  }

  return (
    <dialog
      ref={dialogElementRef}
      aria-labelledby="new-deadline-title"
      className="modal_backdrop "
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
    >
      <div className="modal_default w-xl">
        <div className="flex justify-between mb-2">
            <p className="text-text-secondary">Deadline</p>
            <button
              className="button_text text-text-secondary text-base"
              type="button"
              onClick={closeModal}
            >Back
            </button>
          </div>

        <h1 className="text-3xl truncate py-0.5">{content.title}</h1>

        <div className="divider_default mt-3 mb-5"></div>

        {content.tags.length > 0 && (<div className="flex gap-1 flex-nowrap mb-1.5">
          {content.tags.map((tag) => (
            <p key={tag} className="badge_accent">{tag}</p>
          ))}
        </div>)}
        
        <p className="text-text-secondary mb-12">
          {content.description ? content.description : "No description."}
        </p>

        <div>
          <p className="text-lg">
            Due {content.parsedDueDate.monthName} {content.parsedDueDate.day}, {content.parsedDueDate.hour}:{content.parsedDueDate.minute}
          </p>
        </div>
      </div>
    </dialog>
  )
}