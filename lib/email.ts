function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, "").trim();

  return unquoted || null;
}

const resendApiKey = normalizeEnvValue(process.env.RESEND_API_KEY);
const emailFrom = normalizeEnvValue(process.env.EMAIL_FROM);
const emailReplyTo = normalizeEnvValue(process.env.EMAIL_REPLY_TO);

export function isPasswordResetEmailConfigured() {
  return Boolean(
    resendApiKey?.startsWith("re_") &&
      emailFrom &&
      emailFrom.includes("@"),
  );
}

function maskEmailAddress(email: string) {
  const [localPart, domain = ""] = email.split("@");

  if (!localPart) {
    return email;
  }

  const visibleLocal =
    localPart.length <= 2
      ? `${localPart[0] ?? "*"}*`
      : `${localPart.slice(0, 2)}***`;

  return domain ? `${visibleLocal}@${domain}` : visibleLocal;
}

export async function sendPasswordResetEmail(input: {
  name: string;
  to: string;
  resetUrl: string;
}) {
  if (!isPasswordResetEmailConfigured()) {
    console.warn("Password reset email skipped: Resend is not configured.", {
      email: maskEmailAddress(input.to),
      hasEmailFrom: Boolean(emailFrom),
      hasResendApiKey: Boolean(resendApiKey),
      resendKeyLooksValid: Boolean(resendApiKey?.startsWith("re_")),
    });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        reply_to: emailReplyTo || undefined,
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

    if (!response.ok) {
      console.error("Password reset email request failed.", {
        email: maskEmailAddress(input.to),
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    console.info("Password reset email accepted by Resend.", {
      email: maskEmailAddress(input.to),
    });
    return true;
  } catch (error) {
    console.error("Password reset email request threw an error.", {
      email: maskEmailAddress(input.to),
      error,
    });
    return false;
  }
}
