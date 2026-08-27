import EmailLayout from '../components/email-layout';
import { Text } from '@react-email/components';
import { m } from '@/locale/paraglide/messages';

const en = { locale: 'en' as const };

interface SignInOtpProps {
  otp: string;
  name?: string;
}

export default function SignInOtp({ otp, name }: SignInOtpProps) {
  const greeting = name
    ? `${m.mail_sign_in_otp_greeting(undefined, en)} ${name}.`
    : m.mail_sign_in_otp_greeting(undefined, en);

  return (
    <EmailLayout>
      <Text>{greeting}</Text>
      <Text>{m.mail_sign_in_otp_body(undefined, en)}</Text>
      <Text className="text-2xl font-semibold tracking-[0.3em]">{otp}</Text>
      <Text>{m.mail_sign_in_otp_footer(undefined, en)}</Text>
    </EmailLayout>
  );
}
