type ActionFailure = { success: false; error?: string };

type NestedActionResult<T> = {
  data?: { success: true; data: T } | ActionFailure;
  serverError?: unknown;
};

type FlatActionResult<T extends Record<string, unknown>> = {
  data?: ({ success: true } & T) | ActionFailure;
  serverError?: unknown;
};

export async function wrapNestedServerFn<T>(
  run: () => Promise<T>
): Promise<NestedActionResult<T>> {
  try {
    const data = await run();
    return { data: { success: true as const, data } };
  } catch (error) {
    console.error('server fn error:', error);
    return {
      serverError: error,
      data: {
        success: false as const,
        error: error instanceof Error ? error.message : undefined,
      },
    };
  }
}

export async function wrapFlatServerFn<T extends Record<string, unknown>>(
  run: () => Promise<T>
): Promise<FlatActionResult<T>> {
  try {
    const data = await run();
    return { data: { success: true as const, ...data } };
  } catch (error) {
    console.error('server fn error:', error);
    return {
      serverError: error,
      data: {
        success: false as const,
        error: error instanceof Error ? error.message : undefined,
      },
    };
  }
}

export async function wrapRecognitionServerFn(
  run: () => Promise<{
    success: boolean;
    error?: string;
    data?: unknown;
  }>
): Promise<{
  data?: { success: true; data: unknown } | ActionFailure;
  serverError?: unknown;
}> {
  try {
    const result = await run();
    if (!result.success) {
      return {
        data: {
          success: false as const,
          error: result.error,
        },
      };
    }
    return { data: { success: true as const, data: result.data } };
  } catch (error) {
    console.error('recognition server fn error:', error);
    return { serverError: error };
  }
}
