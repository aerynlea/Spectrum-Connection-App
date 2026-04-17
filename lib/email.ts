function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, "").trim();

  return unquoted || null;
}

function extractEmailAddress(value: string | null) {
  if (!value) {
    return null;
  }

  const angleBracketMatch = value.match(/<([^>]+)>/);
  const candidate = angleBracketMatch?.[1]?.trim() ?? value.trim();

  return candidate.includes("@") ? candidate : null;
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

export function getPasswordRecoverySupportEmail() {
  return extractEmailAddress(emailReplyTo) ?? extractEmailAddress(emailFrom);
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
        subject: "Guiding Light password help",
        text: [
          `Hi ${input.name},`,
          "",
          "Someone asked to reset the password for your Guiding Light account.",
          `If that was you, open this link to choose a new one: ${input.resetUrl}`,
          "",
          "If you did not ask for this, you can ignore this email.",
          "",
          "Guiding Light Support",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2a44">
            <p>Hi ${input.name},</p>
            <p>Someone asked to reset the password for your Guiding Light account.</p>
            <p>If that was you, open this link to choose a new one:</p>
            <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
            <p>If you did not ask for this, you can ignore this email.</p>
            <p>Guiding Light Support</p>
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
