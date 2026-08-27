import EmailLayout from '../components/email-layout';
import { Text } from '@react-email/components';
import { m } from '@/locale/paraglide/messages';

const en = { locale: 'en' as const };

interface SignUpOtpProps {
  otp: string;
  name?: string;
}

export default function SignUpOtp({ otp, name }: SignUpOtpProps) {
  const greeting = name
    ? `${m.mail_sign_up_otp_greeting(undefined, en)} ${name}.`
    : m.mail_sign_up_otp_greeting(undefined, en);

  return (
    <EmailLayout>
      <Text>{greeting}</Text>
      <Text>{m.mail_sign_up_otp_body(undefined, en)}</Text>
      <Text className="text-2xl font-semibold tracking-[0.3em]">{otp}</Text>
      <Text>{m.mail_sign_up_otp_footer(undefined, en)}</Text>
    </EmailLayout>
  );
}
