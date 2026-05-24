import type { ActiveDocument } from "../types";

const responseDocumentPrefix = "responses:";

export function getResponseDocumentId(formId: string) {
  return `${responseDocumentPrefix}${formId}`;
}

export function getResponseFormId(documentId: ActiveDocument) {
  return documentId.startsWith(responseDocumentPrefix)
    ? documentId.slice(responseDocumentPrefix.length)
    : null;
}

export function isPublicDocument(documentId: ActiveDocument) {
  return documentId === "welcome.md" || documentId === "guide.md";
}

