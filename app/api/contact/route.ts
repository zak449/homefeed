import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const FROM = process.env.EMAIL_FROM ?? "gwakgwak <hello@gwakgwak.app>";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.trim().length > 5000) {
      return NextResponse.json(
        { error: "Message must be under 5,000 characters" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (resend) {
      // Send the contact form to support
      await resend.emails.send({
        from: FROM,
        to: "support@gwakgwak.app",
        reply_to: trimmedEmail,
        subject: `[Contact] ${trimmedSubject} — from ${trimmedName}`,
        html: `
          <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden;">
            <div style="background: #0F0F0F; padding: 24px 32px;">
              <h1 style="color: #FFFFFF; font-size: 20px; margin: 0; font-weight: 700;">
                New Contact Form Submission
              </h1>
            </div>
            <div style="padding: 32px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6B7280; font-weight: 600; width: 80px; vertical-align: top;">Name</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #0F0F0F;">${trimmedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6B7280; font-weight: 600; vertical-align: top;">Email</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #0F0F0F;">
                    <a href="mailto:${trimmedEmail}" style="color: #FF6B2C; text-decoration: none;">${trimmedEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #6B7280; font-weight: 600; vertical-align: top;">Subject</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #0F0F0F;">${trimmedSubject}</td>
                </tr>
              </table>
              <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <p style="margin: 0; font-size: 15px; color: #0F0F0F; line-height: 1.6; white-space: pre-wrap;">${trimmedMessage}</p>
              </div>
              <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                Sent via gwakgwak contact form &middot; ${new Date().toISOString()}
              </p>
            </div>
          </div>
        `,
      });

      // Send confirmation email to the user
      await resend.emails.send({
        from: FROM,
        to: trimmedEmail,
        subject: `We got your message — gwakgwak`,
        html: `
          <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #FF6B2C 0%, #FF8F5C 100%); padding: 32px; text-align: center;">
              <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 700;">
                Message received!
              </h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #0F0F0F; line-height: 1.6; margin: 0 0 16px;">
                Hi ${trimmedName},
              </p>
              <p style="font-size: 16px; color: #0F0F0F; line-height: 1.6; margin: 0 0 16px;">
                Thanks for reaching out! We received your message about <strong>${trimmedSubject}</strong> and will get back to you as soon as we can.
              </p>
              <p style="font-size: 16px; color: #0F0F0F; line-height: 1.6; margin: 0 0 24px;">
                In the meantime, feel free to browse the latest listings and join the conversation.
              </p>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://gwakgwak.app"}"
                   style="display: inline-block; background: #FF6B2C; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Browse gwakgwak
                </a>
              </div>
              <p style="font-size: 13px; color: #9CA3AF; margin: 32px 0 0; text-align: center;">
                &mdash; The gwakgwak team
              </p>
            </div>
          </div>
        `,
      });
    } else {
      // Fallback: log when Resend is not configured
      console.log("=== Contact Form Submission (RESEND_API_KEY not set) ===");
      console.log(`Name:    ${trimmedName}`);
      console.log(`Email:   ${trimmedEmail}`);
      console.log(`Subject: ${trimmedSubject}`);
      console.log(`Message: ${trimmedMessage}`);
      console.log(`Time:    ${new Date().toISOString()}`);
      console.log("========================================================");
    }

    return NextResponse.json(
      { success: true, message: "Your message has been received. We'll get back to you soon." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[contact] Failed to process contact form:", err);
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
}
