import { Facebook, Instagram, WhatsApp } from "../../../config";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

const socialLinks = (): string => `
  <table align="center" role="presentation" style="margin:20px auto 0;">
    <tr>
      <td style="padding:0 8px;">
        <a href="${Facebook}" target="_blank" style="color:#1877f2;text-decoration:none;font-size:14px;">Facebook</a>
      </td>
      <td style="padding:0 8px;">
        <a href="${Instagram}" target="_blank" style="color:#e4405f;text-decoration:none;font-size:14px;">Instagram</a>
      </td>
      <td style="padding:0 8px;">
        <a href="${WhatsApp}" target="_blank" style="color:#1da1f2;text-decoration:none;font-size:14px;">WhatsApp</a>
      </td>
    </tr>
  </table>
`;

const layout = ({ title, body }: { title: string; body: string }): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="520" role="presentation" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:10px;padding:32px;max-width:100%;">
            <tr>
              <td>
                <h2 style="margin:0 0 16px;color:#222;">${title}</h2>
                ${body}
                <hr style="border:none;border-top:1px solid #eee;margin:28px 0 8px;" />
                ${socialLinks()}
                <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">
                  &copy; ${new Date().getFullYear()} All rights reserved.
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

export const templates = {
  [EmailSubjectEnum.CONFIRM_EMAIL]: (data: any) => {
    return layout({
      title: data.title ?? "Confirm your email",
      body: `
        <p style="color:#555;font-size:15px;">Use the code below to confirm your email address:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;background:#f0f4ff;color:#1a3cff;font-size:28px;
                       letter-spacing:6px;font-weight:bold;padding:12px 24px;border-radius:8px;">
            ${data.code}
          </span>
        </div>
        <p style="color:#888;font-size:13px;">If you didn't create an account, you can ignore this email.</p>
      `,
    });
  },

  [EmailSubjectEnum.FORGOT_PASSWORD]: (data: any) => {
    return layout({
      title: data.title ?? "Reset your password",
      body: `
        <p style="color:#555;font-size:15px;">Use the code below to reset your password:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;background:#fff4f0;color:#e4400f;font-size:28px;
                       letter-spacing:6px;font-weight:bold;padding:12px 24px;border-radius:8px;">
            ${data.code}
          </span>
        </div>
        <p style="color:#888;font-size:13px;">If you didn't request this, please ignore this email.</p>
      `,
    });
  },
};

export const verifyEmailTemplate = <T = any>(data: T & { subject: EmailSubjectEnum }) => {
  return templates[data.subject](data);
};