const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

export async function sendPasswordResetEmail(input: {
  name: string;
  to: string;
  resetUrl: string;
}) {
  if (!resendApiKey || !emailFrom) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [input.to],
      subject: "Reset your Guiding Light password",
      text: [
        `Hi ${input.name},`,
        "",
        "We received a request to reset your Guiding Light password.",
        `Use this secure link to choose a new one: ${input.resetUrl}`,
        "",
        "If you did not request this change, you can ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2a44">
          <p>Hi ${input.name},</p>
          <p>We received a request to reset your Guiding Light password.</p>
          <p>
            <a href="${input.resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#5a7be8;color:#ffffff;text-decoration:none;font-weight:700">
              Reset your password
            </a>
          </p>
          <p>If the button does not open, copy this link into your browser:</p>
          <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
          <p>If you did not request this change, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  return response.ok;
}
