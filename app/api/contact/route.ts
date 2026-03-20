import { NextRequest, NextResponse } from "next/server";

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

    // Log the contact form submission
    // TODO: Integrate with email service (e.g., Resend, SendGrid) or store in database
    console.log("=== Contact Form Submission ===");
    console.log(`Name:    ${name.trim()}`);
    console.log(`Email:   ${email.trim()}`);
    console.log(`Subject: ${subject.trim()}`);
    console.log(`Message: ${message.trim()}`);
    console.log(`Time:    ${new Date().toISOString()}`);
    console.log("===============================");

    return NextResponse.json(
      { success: true, message: "Your message has been received. We'll get back to you soon." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
}
