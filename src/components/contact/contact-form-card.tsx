'use client';

import { sendContactMessage } from '@/api/contact';
import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/deskpet-i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export function ContactFormCard() {
  const t = useTranslations('ContactPage.form');
  const [error, setError] = useState<string | undefined>();

  const formSchema = z.object({
    name: z.string().min(3, t('nameMinLength')).max(30, t('nameMaxLength')),
    email: z.email(t('emailValidation')),
    message: z
      .string()
      .min(10, t('messageMinLength'))
      .max(500, t('messageMaxLength')),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', message: '' },
  });
  const isPending = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setError(undefined);
    try {
      await sendContactMessage({ data: values });
      toast.success(t('success'));
      form.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('fail');
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <Card className="mx-auto max-w-lg overflow-hidden pt-6 pb-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('email')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('message')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('message')} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
          </CardContent>
          <CardFooter className="mt-6 flex items-center justify-between rounded-none border-t bg-muted px-6 py-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? t('submitting') : t('submit')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
