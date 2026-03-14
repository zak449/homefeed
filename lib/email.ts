import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "HomeFeed <hello@homefeed.app>";

export async function sendAgentMessage({
  agentEmail,
  agentName,
  senderName,
  senderEmail,
  message,
  listingAddress,
}: {
  agentEmail: string;
  agentName: string;
  senderName: string;
  senderEmail: string;
  message: string;
  listingAddress: string;
}) {
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping send");
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: agentEmail,
    replyTo: senderEmail,
    subject: `New inquiry about ${listingAddress}`,
    html: `
      <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; padding: 40px; border-radius: 16px;">
        <div style="background: #FF6B6B; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: white; font-size: 24px; margin: 0; font-family: Georgia, serif;">New Inquiry — HomeFeed</h1>
        </div>
        <p style="font-size: 16px; color: #1A1A2E;">Hi ${agentName},</p>
        <p style="font-size: 16px; color: #1A1A2E;">You have a new message about <strong>${listingAddress}</strong>.</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
          <p style="margin: 0; font-size: 15px; color: #1A1A2E;">${message}</p>
        </div>
        <p style="font-size: 14px; color: #666;">From: <strong>${senderName}</strong> (${senderEmail})</p>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">Sent via <a href="#" style="color: #FF6B6B;">HomeFeed</a></p>
      </div>
    `,
  });

  // confirmation copy to sender
  await resend.emails.send({
    from: FROM,
    to: senderEmail,
    subject: `Your message to ${agentName} was sent`,
    html: `
      <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; padding: 40px; border-radius: 16px;">
        <div style="background: #6BCB77; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: white; font-size: 24px; margin: 0; font-family: Georgia, serif;">Message sent!</h1>
        </div>
        <p style="font-size: 16px; color: #1A1A2E;">Hi ${senderName},</p>
        <p style="font-size: 16px; color: #1A1A2E;">Your message about <strong>${listingAddress}</strong> was sent to ${agentName}. Expect a reply soon!</p>
      </div>
    `,
  });
}

export async function sendReactionAlert({
  recipientEmail,
  recipientName,
  reactorName,
  reactionType,
  listingAddress,
  listingId,
  commentSnippet,
}: {
  recipientEmail: string;
  recipientName: string;
  reactorName: string;
  reactionType: string;
  listingAddress: string;
  listingId: string;
  commentSnippet: string;
}) {
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `${reactorName} reacted to your comment on HomeFeed`,
    html: `
      <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; padding: 40px; border-radius: 16px;">
        <div style="background: #FFD93D; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: #1A1A2E; font-size: 24px; margin: 0; font-family: Georgia, serif;">${reactionType} New reaction on HomeFeed</h1>
        </div>
        <p style="font-size: 16px; color: #1A1A2E;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1A1A2E;"><strong>${reactorName}</strong> reacted ${reactionType} to your comment on <strong>${listingAddress}</strong>:</p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FFD93D; font-style: italic; color: #555;">
          "${commentSnippet}"
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/listing/${listingId}"
           style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600;">
          View the conversation →
        </a>
      </div>
    `,
  });
}

export async function sendNewCommentAlert({
  subscribers,
  commenterName,
  listingAddress,
  listingId,
  commentSnippet,
}: {
  subscribers: string[];
  commenterName: string;
  listingAddress: string;
  listingId: string;
  commentSnippet: string;
}) {
  if (!resend || subscribers.length === 0) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  await Promise.all(
    subscribers.map((email) =>
      resend!.emails.send({
        from: FROM,
        to: email,
        subject: `New comment on ${listingAddress}`,
        html: `
          <div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; padding: 40px; border-radius: 16px;">
            <div style="background: #4D96FF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h1 style="color: white; font-size: 24px; margin: 0; font-family: Georgia, serif;">New comment on HomeFeed</h1>
            </div>
            <p style="font-size: 16px; color: #1A1A2E;"><strong>${commenterName}</strong> just commented on <strong>${listingAddress}</strong>:</p>
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #4D96FF; font-style: italic; color: #555;">
              "${commentSnippet}"
            </div>
            <a href="${baseUrl}/listing/${listingId}"
               style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600;">
              Join the conversation →
            </a>
          </div>
        `,
      })
    )
  );
}
