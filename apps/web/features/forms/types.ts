export type FormFile = {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published" | "archived";
  dirty: boolean;
  content: string;
  fields: FormField[];
  savedFields: FormField[];
  lastUpdatedAt?: Date | string;
  accessMode: "public" | "authenticated";
  resultVisibility: "hidden" | "after_submit" | "creator_only";
};

export type FormFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "date"
  | "time"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "rating"
  | "opinion_scale"
  | "yes_no"
  | "file_upload"
  | "statement";

export type FormField = {
  id: string;
  type: FormFieldType;
  title: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  validation?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  saved?: boolean;
};

export type PublicDocumentId = "welcome.md" | "guide.md";
export type ActiveDocument = PublicDocumentId | string;

