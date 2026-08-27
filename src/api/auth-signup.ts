import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { signupWithOtp } from '@/server/auth/signup-with-otp';
import * as z from 'zod';

const signupWithOtpSchema = z.object({
  email: z.email(),
});

export const signupWithOtpFn = createServerFn({ method: 'POST' })
  .validator(signupWithOtpSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    return signupWithOtp({
      email: data.email,
      headers,
    });
  });
