export function formatLastUpdated(value?: Date | string, emptyLabel = "Not saved yet") {
  if (!value) {
    return emptyLabel;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return emptyLabel;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSubmissionDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatAnswerValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "No answer";
  }

  if (value === undefined || value === null || value === "") {
    return "No answer";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

