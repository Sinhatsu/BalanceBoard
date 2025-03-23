"use server";

import { Resend } from "resend";
import React from "react";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

interface SendEmailSuccess {
  success: true;
  data: any;
}

interface SendEmailFailure {
  success: false;
  error: any;
}

type SendEmailResponse = SendEmailSuccess | SendEmailFailure;

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<SendEmailResponse> {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  try {
    const data = await resend.emails.send({
      from: "BalanceBoard <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
