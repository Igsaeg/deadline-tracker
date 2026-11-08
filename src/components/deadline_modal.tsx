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
      <div className="modal_default w-xl min-h-92">
        <div className="flex mb-1">
            <button
              className="button_text text-text-secondary text-base"
              type="button"
              onClick={closeModal}
            >Back
            </button>
        </div>

        <h1 className="text-3xl truncate">{content.title}</h1>

        <div className="divider_default my-4"></div>

        <div className="mb-10">
          {content.tags.length > 0 && (<div className="flex gap-1 flex-nowrap mb-3">
            {content.tags.map((tag) => (
              <p key={tag} className="badge_accent">{tag}</p>
            ))}
          </div>)}
          <p className="text-text-secondary">{content.description}</p>
        </div>

        <div>
          <p className="text-lg">Due {content.parsedDueDate.monthName} {content.parsedDueDate.day}, {content.parsedDueDate.hour}:{content.parsedDueDate.minute}</p>
        </div>
    
      </div>
    </dialog>
  )
}