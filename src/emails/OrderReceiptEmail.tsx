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
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderReceiptEmailProps {
  customerName: string;
  orderId: string;
  items: ReceiptItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  date: string;
}

export const OrderReceiptEmail = ({
  customerName = "مشتری عزیز",
  orderId = "12345",
  items = [
    { name: "محصول تستی", quantity: 1, price: 100000 }
  ],
  subtotal = 100000,
  shipping = 45000,
  total = 145000,
  shippingAddress = "تهران، خیابان ولیعصر...",
  date = new Date().toLocaleDateString('fa-IR'),
}: OrderReceiptEmailProps) => {
  const shortOrderId = orderId.split("-")[0];

  return (
    <Html dir="rtl">
      <Head />
      <Preview>رسید پرداخت سفارش #{shortOrderId}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg my-10 mx-auto p-8 max-w-xl shadow-sm">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-violet-600 m-0">
                فروشگاه اکستیم
              </Heading>
            </Section>
            
            <Section className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Text className="text-green-600 text-3xl m-0">✓</Text>
              </div>
              <Heading className="text-xl font-bold text-gray-800 m-0">
                پرداخت شما با موفقیت انجام شد
              </Heading>
              <Text className="text-gray-500 text-sm mt-2">
                سفارش شما ثبت شد و به زودی پردازش می‌شود.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Section className="mb-6">
              <Row>
                <Column>
                  <Text className="text-gray-500 text-xs m-0">شماره سفارش</Text>
                  <Text className="text-gray-900 font-bold m-0 mt-1 font-mono">#{shortOrderId}</Text>
                </Column>
                <Column>
                  <Text className="text-gray-500 text-xs m-0">تاریخ پرداخت</Text>
                  <Text className="text-gray-900 font-bold m-0 mt-1">{date}</Text>
                </Column>
                <Column>
                  <Text className="text-gray-500 text-xs m-0">گیرنده</Text>
                  <Text className="text-gray-900 font-bold m-0 mt-1">{customerName}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-100">
              <Text className="text-gray-800 font-bold text-sm mb-4">آدرس ارسال</Text>
              <Text className="text-gray-600 text-sm leading-6 m-0">
                {shippingAddress}
              </Text>
            </Section>

            <Heading className="text-lg font-bold text-gray-800 mb-4">
              اقلام سفارش
            </Heading>

            <Section className="mb-6">
              {items.map((item, index) => (
                <Row key={index} className="border-b border-gray-100 py-3">
                  <Column className="w-8/12 pr-2">
                    <Text className="text-gray-800 text-sm font-medium m-0 truncate">
                      {item.name}
                    </Text>
                  </Column>
                  <Column className="w-2/12 text-center">
                    <Text className="text-gray-500 text-sm m-0">
                      x{item.quantity}
                    </Text>
                  </Column>
                  <Column className="w-2/12 text-left">
                    <Text className="text-gray-800 font-bold text-sm m-0">
                      {(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Section className="mb-8">
              <Row className="mb-2">
                <Column className="text-right">
                  <Text className="text-gray-500 text-sm m-0">مبلغ کل اقلام</Text>
                </Column>
                <Column className="text-left">
                  <Text className="text-gray-800 text-sm m-0">{subtotal.toLocaleString()} تومان</Text>
                </Column>
              </Row>
              <Row className="mb-4">
                <Column className="text-right">
                  <Text className="text-gray-500 text-sm m-0">هزینه ارسال</Text>
                </Column>
                <Column className="text-left">
                  <Text className="text-gray-800 text-sm m-0">
                    {shipping === 0 ? "رایگان" : `${shipping.toLocaleString()} تومان`}
                  </Text>
                </Column>
              </Row>
              <Row className="border-t border-gray-200 pt-4">
                <Column className="text-right">
                  <Text className="text-gray-900 font-bold text-base m-0">مبلغ پرداخت شده</Text>
                </Column>
                <Column className="text-left">
                  <Text className="text-violet-600 font-bold text-lg m-0">{total.toLocaleString()} تومان</Text>
                </Column>
              </Row>
            </Section>
            
            <Text className="text-gray-500 text-sm leading-5 text-center mt-8 border-t border-gray-200 pt-6">
              از خرید شما متشکریم!
              <br />
              در صورت بروز هرگونه مشکل با پشتیبانی تماس بگیرید.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderReceiptEmail;
