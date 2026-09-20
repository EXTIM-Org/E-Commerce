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
  Img,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface OrderStatusEmailProps {
  customerName: string;
  orderId: string;
  status: string;
}

const statusTextMap: Record<string, string> = {
  SHIPPED: "ارسال شد",
  DELIVERED: "تحویل داده شد",
  CANCELLED: "لغو شد",
};

const statusMessageMap: Record<string, string> = {
  SHIPPED: "سفارش شما با موفقیت به اداره پست / پیک تحویل داده شد و به زودی به دست شما می‌رسد.",
  DELIVERED: "سفارش شما با موفقیت تحویل داده شد. از خرید شما سپاسگزاریم!",
  CANCELLED: "متاسفانه سفارش شما لغو شده است. در صورت پرداخت، مبلغ به حساب شما عودت داده خواهد شد.",
};

export const OrderStatusEmail = ({
  customerName = "مشتری عزیز",
  orderId = "12345",
  status = "SHIPPED",
}: OrderStatusEmailProps) => {
  const shortOrderId = orderId.split("-")[0];
  const translatedStatus = statusTextMap[status] || status;
  const statusMessage = statusMessageMap[status] || "وضعیت سفارش شما بروزرسانی شد.";

  return (
    <Html dir="rtl">
      <Head />
      <Preview>سفارش #{shortOrderId} - {translatedStatus}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg my-10 mx-auto p-10 max-w-lg shadow-sm">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-violet-600 m-0">
                فروشگاه اکستیم
              </Heading>
            </Section>
            
            <Heading className="text-xl font-bold text-gray-800 text-center mb-6">
              وضعیت سفارش شما تغییر کرد
            </Heading>
            
            <Text className="text-gray-700 text-base leading-6 mb-4">
              سلام <strong>{customerName}</strong> عزیز،
            </Text>
            
            <Text className="text-gray-700 text-base leading-6 mb-6">
              {statusMessage}
            </Text>
            
            <Section className="bg-gray-50 rounded-lg p-6 mb-6 text-center border border-gray-100">
              <Text className="text-sm text-gray-500 m-0 mb-1">شماره سفارش</Text>
              <Text className="text-lg font-mono font-bold text-gray-900 m-0">#{shortOrderId}</Text>
              
              <Hr className="border-gray-200 my-4" />
              
              <Text className="text-sm text-gray-500 m-0 mb-1">وضعیت فعلی</Text>
              <Text className="text-lg font-bold text-violet-600 m-0">{translatedStatus}</Text>
            </Section>
            
            <Text className="text-gray-500 text-sm leading-5 text-center mt-8">
              اگر سوالی دارید، می‌توانید به همین ایمیل پاسخ دهید.
              <br />
              تیم پشتیبانی اکستیم
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderStatusEmail;
