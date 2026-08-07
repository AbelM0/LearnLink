export function getUserFacingError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string"
          ? error.message
          : "";

  const trimmedMessage = message.trim().replace(/^Error:\s*/i, "");

  if (
    !trimmedMessage ||
    trimmedMessage === "Error" ||
    trimmedMessage.includes("webpack-internal") ||
    trimmedMessage.includes("captureStackTrace") ||
    trimmedMessage.includes("react-dev-overlay")
  ) {
    return fallback;
  }

  const timeoutPrefix = "You are timed out from this class until ";
  if (trimmedMessage.startsWith(timeoutPrefix)) {
    const timeoutDate = new Date(trimmedMessage.slice(timeoutPrefix.length));
    if (!Number.isNaN(timeoutDate.getTime())) {
      return `You are timed out from this class until ${timeoutDate.toLocaleString()}.`;
    }
  }

  if (trimmedMessage === "Unauthorized") {
    return "Your session has expired. Please sign in again.";
  }

  return trimmedMessage.split("\n")[0].slice(0, 300);
}
