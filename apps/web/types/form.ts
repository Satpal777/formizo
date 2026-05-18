export type FormStatus = "draft" | "published" | "archived";

export interface FormSummary {
  id: string;
  name: string;
  status: FormStatus;
  responseCount: number;
}
