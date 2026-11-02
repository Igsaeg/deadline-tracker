import React, { useState } from "react";
import { insertDeadline } from "../lib/supabase/deadlines";

type FieldName = "title" | "tags" | "due_date";
type FieldErrors = Partial<Record<FieldName, string>>;

type CreateDeadlineModalProps = {
  setIsCreateDeadlineModalOpen: (isOpen: boolean) => void;
};

export default function CreateDeadlineModal({
  setIsCreateDeadlineModalOpen,
}: CreateDeadlineModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagsValue, setTagsValue] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!title.trim()) errors.title = "Title is required.";
    if (!dueDate.trim()) errors.due_date = "Due date is required.";

    return errors;
  }

  function clearFieldError(field: FieldName) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleTags(value: string, commitPending: boolean = false) {
    const trimmed = value.trim().toLowerCase().replace(/[^a-zA-Z0-9-]/g, "");
    setTagsValue(value);
    clearFieldError("tags");
    
    if (!trimmed) return;
  
    if (value.endsWith(" ") || value.endsWith(",") || commitPending) {
      setTagsValue("");
    
      if (tags.length >= 4) {
        setFieldErrors((prev) => ({ ...prev, "tags": "You can only add up to 4 tags." }));
        return;
      }

      setTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    }
  }

  async function submitForm(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    handleTags(tagsValue, true);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    
    try {
      await insertDeadline(
        title.trim(),
        description.trim(),
        tags,
        new Date(dueDate).toISOString()
      );
      setIsCreateDeadlineModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="bg-surface/10 backdrop-blur fixed inset-0 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCreateDeadlineModalOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-deadline-title"
        className="surface_default w-md px-10 py-12"
      >
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
              onChange={(e) => {
                clearFieldError("title");
                setTitle(e.target.value);
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
              onChange={(e) => setDescription(e.target.value)}
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
                value={tagsValue}
                maxLength={30}
                autoComplete="off"
                aria-invalid={!!fieldErrors.tags}
                aria-describedby={fieldErrors.tags ? "tags-error" : undefined}
                onChange={(e) => handleTags(e.target.value)}
                onBlur={(e) => handleTags(e.target.value, true)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && e.currentTarget.value === "") setTags((prev) => prev.slice(0, -1));
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
              className={`${fieldErrors.due_date ? "input_error" : "input_default"} transition_default`}
              id="due_date"
              name="due_date"
              type="datetime-local"
              value={dueDate}
              required
              aria-invalid={!!fieldErrors.due_date}
              aria-describedby={fieldErrors.due_date ? "due-date-error" : undefined}
              onChange={(e) => {
                clearFieldError("due_date");
                setDueDate(e.target.value);
              }}
            />
            {fieldErrors.due_date && (
              <p id="due-date-error" className="input_hint_error">
                {fieldErrors.due_date}
              </p>
            )}
          </div>

          {errorMessage && <p role="alert" className="text-danger">{errorMessage}</p>}

          <div className="mt-2 flex gap-2">
            <button
              className="button_secondary flex-1"
              type="button"
              onClick={() => setIsCreateDeadlineModalOpen(false)}
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
    </div>
  );
}