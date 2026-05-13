export type UserFacingError = {
  code: string;
  message: string;
  retryable: boolean;
};

const DEFAULT_ERROR: UserFacingError = {
  code: "UNKNOWN_ERROR",
  message: "Something went wrong. Please try again.",
  retryable: true,
};

export function toUserFacingError(err: unknown): UserFacingError {
  const rawMessage =
    (typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string" &&
      (err as { message: string }).message) ||
    "";

  if (!rawMessage) return DEFAULT_ERROR;

  if (rawMessage.toLowerCase().includes("timeout")) {
    return {
      code: "NETWORK_TIMEOUT",
      message: "The payment service took too long to respond. Please try again.",
      retryable: true,
    };
  }

  if (rawMessage.toLowerCase().includes("network")) {
    return {
      code: "NETWORK_ERROR",
      message: "Network issue detected. Please check your connection and retry.",
      retryable: true,
    };
  }

  if (rawMessage.toLowerCase().includes("validation")) {
    return {
      code: "VALIDATION_ERROR",
      message: "Please review the booking details and try again.",
      retryable: false,
    };
  }

  return {
    code: "REQUEST_FAILED",
    message: rawMessage,
    retryable: true,
  };
}
