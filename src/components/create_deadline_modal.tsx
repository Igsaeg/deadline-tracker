import React, { useEffect, useRef, useState } from "react";
import { createDeadline } from "../lib/supabase/deadlines";

type DeadlineFieldName = "title" | "tags" | "dueDate";
type DeadlineFieldErrors = Partial<Record<DeadlineFieldName, string>>;

type CreateDeadlineModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDeadlinesChanged: () => void;
};

export default function CreateDeadlineModal({ isOpen, onClose, onDeadlinesChanged }: CreateDeadlineModalProps) {
  const dialogElementRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<DeadlineFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

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

  function validateDeadlineFields(): DeadlineFieldErrors {
    const validationErrors: DeadlineFieldErrors = {};

    if (!title.trim()) validationErrors.title = "Title is required.";
    if (!dueDate.trim()) validationErrors.dueDate = "Due date is required.";

    return validationErrors;
  }

  function clearFieldError(fieldName: DeadlineFieldName) {
    setFieldErrors((previousValue) => ({ ...previousValue, [fieldName]: undefined }));
  }

  function handleTagInput(inputValue: string, shouldCommitPendingTag: boolean = false) {
    const normalizedTag = inputValue.trim().toLowerCase().replace(/[^a-zA-Z0-9-]/g, "");
    setTagInput(inputValue);
    clearFieldError("tags");
    
    if (!normalizedTag) return;
  
    if (inputValue.endsWith(" ") || inputValue.endsWith(",") || shouldCommitPendingTag) {
      setTagInput("");
    
      if (tags.length >= 4) {
        setFieldErrors((previousValue) => ({ ...previousValue, tags: "You can only add up to 4 tags." }));
        return;
      }

      setTags((previousTags) => (previousTags.includes(normalizedTag) ? previousTags : [...previousTags, normalizedTag]));
    }
  }

  async function submitForm(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    handleTagInput(tagInput, true);

    const validationErrors = validateDeadlineFields();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    
    try {
      await createDeadline(
        title.trim(),
        description.trim(),
        tags,
        new Date(dueDate).toISOString()
      );
      closeModal();
      onDeadlinesChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogElementRef}
      aria-labelledby="new-deadline-title"
      className="fixed inset-0 m-0 open:flex h-dvh max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-0 text-inherit backdrop:bg-surface/1 backdrop:backdrop-blur"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
    >
      <div className="surface_default w-md px-10 py-12">
        <h3 id="new-deadline-title" className="text-2xl text-center mb-6">New deadline</h3>

        <form className="flex flex-col gap-3" onSubmit={submitForm} noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="input_label">Title</label>
            <input
              className={`${fieldErrors.title ? "input_error" : "input_default"} transition_default`}
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Design review"
              value={title}
              maxLength={80}
              required
              autoComplete="off"
              aria-invalid={!!fieldErrors.title}
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
              onChange={(event) => {
                clearFieldError("title");
                setTitle(event.target.value);
              }}
            />
            {fieldErrors.title && (
              <p id="title-error" className="input_hint_error">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="input_label">Description</label>
            <textarea
              className="input_default h-22 resize-none"
              id="description"
              name="description"
              placeholder="Add a short reminder"
              value={description}
              maxLength={250}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="tags" className="input_label">Tags</label>
            <div className={`transition_default flex flex-wrap gap-2
                            ${fieldErrors.tags ? "input_error focus-within:ring-3 focus-within:ring-danger-border focus-within:border-danger"
                            : "input_default focus-within:ring-3 focus-within:ring-accent-ring focus-within:border-accent-pressed"}`}
            >
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <p key={tag} className="badge_accent w-fit line-clamp-1">
                      {tag}
                    </p>
                  ))}
                </div>
              )}
              <input
                className="min-w-8 flex-1 bg-transparent outline-none"
                id="tags"
                name="tags"
                type="text"
                placeholder={tags.length > 0 ? "" : "e.g. work, urgent"}
                value={tagInput}
                maxLength={30}
                autoComplete="off"
                aria-invalid={!!fieldErrors.tags}
                aria-describedby={fieldErrors.tags ? "tags-error" : undefined}
                onChange={(event) => handleTagInput(event.target.value)}
                onBlur={(event) => handleTagInput(event.target.value, true)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && event.currentTarget.value === "") setTags((previousTags) => previousTags.slice(0, -1));
                }}
              />
            </div>
            {fieldErrors.tags && (
              <p id="tags-error" className="input_hint_error">
                {fieldErrors.tags}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="due_date" className="input_label">Due date</label>
            <input
              className={`${fieldErrors.dueDate ? "input_error" : "input_default"} transition_default`}
              id="due_date"
              name="due_date"
              type="datetime-local"
              value={dueDate}
              required
              aria-invalid={!!fieldErrors.dueDate}
              aria-describedby={fieldErrors.dueDate ? "due-date-error" : undefined}
              onChange={(event) => {
                clearFieldError("dueDate");
                setDueDate(event.target.value);
              }}
            />
            {fieldErrors.dueDate && (
              <p id="due-date-error" className="input_hint_error">
                {fieldErrors.dueDate}
              </p>
            )}
          </div>

          {errorMessage && <p role="alert" className="text-danger">{errorMessage}</p>}

          <div className="mt-2 flex gap-2">
            <button
              className="button_secondary flex-1"
              type="button"
              onClick={closeModal}
            >Cancel
            </button>
            <button
              className={`${isSubmitting ? "button_disabled" : "button_accent"} transition_default flex-1 `}
              type="submit"
              disabled={isSubmitting}
            >{isSubmitting ? "Please wait..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}