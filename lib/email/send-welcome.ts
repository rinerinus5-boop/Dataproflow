interface WelcomeEmailParams {
  email: string;
  fullName: string;
}

export async function sendWelcomeEmail({ email, fullName }: WelcomeEmailParams) {
  try {
    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.log(`Welcome email would be sent to ${email} (${fullName}) - Resend not configured`);
      return { success: true };
    }

    // Send welcome email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DataProFlow <noreply@yourdomain.com>',
        to: email,
        subject: 'Welcome to DataProFlow! 🎉',
        html: getWelcomeEmailHTML(fullName),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    console.log(`Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Welcome email error:", error);
    return { success: false, error };
  }
}

function getWelcomeEmailHTML(fullName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DataProFlow</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to DataProFlow! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${fullName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for signing up with DataProFlow! We're excited to have you on board.
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your account is now active with a <strong>14-day free trial</strong> of our Starter plan. Here's what you can do:
              </p>
              <ul style="margin: 0 0 24px; padding-left: 24px; color: #374151; font-size: 15px; line-height: 1.8;">
                <li>Connect your social media accounts (TikTok, Instagram, Facebook)</li>
                <li>View analytics and insights from all your platforms in one place</li>
                <li>Track your performance metrics in real-time</li>
                <li>Manage multiple accounts seamlessly</li>
              </ul>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com'}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #152a44 0%, #1e3a5f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(21, 42, 68, 0.4);">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px; background-color: #f0f9ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Pro Tip:</strong> Start by connecting your first social media account to see your analytics come to life!
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Best regards,<br><strong>The DataProFlow Team</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2024 DataProFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
