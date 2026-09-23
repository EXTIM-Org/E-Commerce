type SendSmsOptions = {
  to: string;
  text: string;
};

export async function sendSms({ to, text }: SendSmsOptions) {
  const { SMS_PROVIDER, SMS_API_KEY } = process.env;

  // If SMS provider is not configured, mock the SMS sending for development
  if (!SMS_PROVIDER || !SMS_API_KEY) {
    console.log("\n==================================================");
    console.log("📱 [MOCK SMS] - SMS Provider not configured.");
    console.log(`To: ${to}`);
    console.log(`Message: ${text}`);
    console.log("==================================================\n");
    return { success: true, mocked: true };
  }

  try {
    // NOTE: This is a placeholder for real SMS provider integration.
    // E.g. Kavenegar, Ghasedak, FarazSMS, etc.
    // You would use fetch() or the provider's SDK here.
    
    console.log(`[SMS] Sending to ${to} via ${SMS_PROVIDER}...`);
    
    // const response = await fetch(`https://api.sms-provider.com/v1/send`, { ... });
    // if (!response.ok) throw new Error("SMS API failed");

    return { success: true };
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return { success: false, error };
  }
}
