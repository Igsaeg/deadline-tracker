import React, { useEffect, useRef, useState } from "react";
import { createDeadline } from "../lib/deadlines";

type DeadlineFieldName = "title" | "tags" | "dueDate";
type DeadlineFieldErrors = Partial<Record<DeadlineFieldName, string>>;

type CreateDeadlineModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDeadlinesChanged: () => void;
};

const MAX_TAGS_LENGTH = 4;

export default function CreateDeadlineModal({ isOpen, onClose, onDeadlinesChanged }: CreateDeadlineModalProps) {
  const dialogElementRef = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const pressStartedOnBackdrop = useRef(false);
  
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
    if (!dueDate)
      validationErrors.dueDate = "Due date is required.";
    else if (new Date(dueDate).getTime() < Date.now())
      validationErrors.dueDate = "Due date must not be older than now.";

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
    
      if (tags.length >= MAX_TAGS_LENGTH) {
        setFieldErrors((previousValue) => ({ ...previousValue, tags: `You can only add up to ${MAX_TAGS_LENGTH} tags.` }));
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
        new Date(dueDate).toISOString(),
      );
      closeModal();
      onDeadlinesChanged();
      setTitle("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setDueDate("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogElementRef}
      className="modal_backdrop"
      aria-labelledby="new-deadline-title"
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressStartedOnBackdrop.current && event.target === event.currentTarget) {
          closeModal();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
    >
      <div className="modal_default w-xl">
        <form onSubmit={submitForm} noValidate>
          <p className="text-text-secondary mb-4">New Deadline</p>

          <div>
            <input
              className={`transition_default text-2xl font-medium px-3
                        ${fieldErrors.title ? "textarea_error" : "textarea_default"}`}
              name="title"
              type="text"
              placeholder="Title"
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
              <p className="input_hint_error mt-1" id="title-error">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="divider_default mt-3 mb-5"></div>

          <div className="mb-2">
            <div 
              className={`transition_default flex flex-nowrap gap-1.5 overflow-x-auto rounded-lg scrollbar_hidden
                        ${fieldErrors.tags ? "textarea_error focus-within:ring-3 focus-within:ring-danger-border focus-within:border-danger"
                        : "textarea_default focus-within:ring-3 focus-within:ring-accent-ring focus-within:border-accent"}`}
            >
              {tags.length > 0 && (
                <div className="flex gap-1">
                  {tags.map((tag) => (
                    <p className="badge_accent" key={tag}>
                      {tag}
                    </p>
                  ))}
                </div>
              )}
              <input
                className="outline-none w-full pl-0.5"
                name="tags"
                type="text"
                placeholder={tags.length > 0 ? "" : "Tags"}
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
              <p className="input_hint_error mt-1" id="tags-error" >
                {fieldErrors.tags}
              </p>
            )}
          </div>

          <textarea
            className="textarea_default resize-none mb-6"
            name="description"
            placeholder="Description"
            value={description}
            maxLength={200}
            rows={3}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) event.preventDefault();
            }}
          />

          <div className="flex flex-col gap-1 mb-4">
            <label className="input_label" htmlFor="due_date">
              Due date
            </label>
            <input
              className={`transition_default
                        ${fieldErrors.dueDate ? "textarea_error" : "textarea_default"}`}
              id="due_date"
              name="due_date"
              type="datetime-local"
              lang="en-GB"
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
              <p className="input_hint_error" id="due-date-error">
                {fieldErrors.dueDate}
              </p>
            )}
          </div>

          {errorMessage && <p className="text-danger" role="alert">
            {errorMessage}
          </p>}

          <div className="flex gap-2">
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