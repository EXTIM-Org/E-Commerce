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
  Button,
} from "@react-email/components";
import * as React from "react";

interface TicketReplyEmailProps {
  customerName: string;
  ticketId: string;
  ticketSubject: string;
  replyText: string;
  ticketUrl: string;
}

export const TicketReplyEmail = ({
  customerName = "مشتری عزیز",
  ticketId = "12345",
  ticketSubject = "مشکل در سفارش",
  replyText = "سلام، مشکل شما بررسی و برطرف شد.",
  ticketUrl = "http://localhost:3000/profile/tickets/12345",
}: TicketReplyEmailProps) => {
  const shortTicketId = ticketId.split("-")[0];

  return (
    <Html dir="rtl">
      <Head />
      <Preview>پاسخ جدید به تیکت #{shortTicketId}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg my-10 mx-auto p-10 max-w-lg shadow-sm">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-violet-600 m-0">
                فروشگاه اکستیم
              </Heading>
            </Section>
            
            <Heading className="text-xl font-bold text-gray-800 text-center mb-6">
              پاسخ جدید به تیکت شما
            </Heading>
            
            <Text className="text-gray-700 text-base leading-6 mb-4">
              سلام <strong>{customerName}</strong> عزیز،
            </Text>
            
            <Text className="text-gray-700 text-base leading-6 mb-6">
              یک پاسخ جدید برای تیکت شما با عنوان «<strong>{ticketSubject}</strong>» ثبت شده است.
            </Text>
            
            <Section className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
              <Text className="text-sm text-gray-500 m-0 mb-2">متن پاسخ:</Text>
              <Text className="text-base text-gray-800 m-0 leading-7 whitespace-pre-wrap">
                {replyText}
              </Text>
            </Section>
            
            <Section className="text-center mb-8 mt-6">
              <Button
                href={ticketUrl}
                className="bg-violet-600 rounded text-white text-base font-bold py-3 px-6 no-underline text-center inline-block"
              >
                مشاهده تیکت و پاسخ
              </Button>
            </Section>

            <Text className="text-gray-500 text-sm leading-5 text-center mt-8">
              تیم پشتیبانی اکستیم
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TicketReplyEmail;
