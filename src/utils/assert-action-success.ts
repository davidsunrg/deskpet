export function assertActionSuccess<
  T extends { success: boolean; error?: string },
>(
  result: {
    data?: T;
    serverError?: unknown;
    validationErrors?: unknown;
  },
  fallback: string
): asserts result is { data: T & { success: true } } {
  if (result.serverError) {
    console.error('action serverError:', result.serverError);
    throw new Error(fallback);
  }

  if (!result.data?.success) {
    console.error('action returned failure:', result.data);
    throw new Error(result.data?.error || fallback);
  }
}
