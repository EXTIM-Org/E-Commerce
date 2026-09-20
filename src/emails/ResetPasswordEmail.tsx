import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  customerName: string;
  resetLink: string;
}

export const ResetPasswordEmail = ({
  customerName = "کاربر گرامی",
  resetLink = "http://localhost:3000/reset-password",
}: ResetPasswordEmailProps) => {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>بازیابی رمز عبور حساب کاربری شما</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg my-10 mx-auto p-10 max-w-lg shadow-sm">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-violet-600 m-0">
                فروشگاه اکستیم
              </Heading>
            </Section>
            
            <Heading className="text-xl font-bold text-gray-800 text-center mb-6">
              درخواست بازیابی رمز عبور
            </Heading>
            
            <Text className="text-gray-700 text-base leading-6 mb-4">
              سلام <strong>{customerName}</strong> عزیز،
            </Text>
            
            <Text className="text-gray-700 text-base leading-6 mb-6">
              ما درخواستی برای تغییر رمز عبور حساب کاربری شما دریافت کرده‌ایم. در صورتی که این درخواست از طرف شما بوده است، می‌توانید از طریق دکمه زیر رمز عبور خود را تغییر دهید:
            </Text>
            
            <Section className="text-center mb-6 mt-6">
              <Link
                href={resetLink}
                className="bg-violet-600 text-white font-bold px-6 py-3 rounded-md text-base no-underline inline-block"
              >
                تغییر رمز عبور
              </Link>
            </Section>

            <Text className="text-gray-500 text-sm leading-6 mb-6 text-center">
              اگر لینک بالا کار نمی‌کند، آدرس زیر را کپی کرده و در مرورگر خود باز کنید:
              <br />
              <Link href={resetLink} className="text-violet-600 break-all">{resetLink}</Link>
            </Text>
            
            <Hr className="border-gray-200 my-4" />
            
            <Text className="text-gray-500 text-sm leading-5 text-center mt-8">
              اگر شما این درخواست را نداده‌اید، می‌توانید این ایمیل را نادیده بگیرید. رمز عبور شما تغییر نخواهد کرد.
              <br />
              تیم پشتیبانی اکستیم
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;
