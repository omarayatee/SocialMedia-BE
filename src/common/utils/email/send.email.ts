import nodemailer from "nodemailer";
import { EmailSubjectEnum } from "../../enum";
import { APP_EMAIL, APP_PASSWORD } from "../../../config";
import { BadRequestException } from "../../exception";

export const UserEmailKey = ({ email, subject }: { email: string; subject: EmailSubjectEnum }): string => {
  return `User::${email}::${subject}::OTP`;
};

export const UserEmailTrailsKey = ({ email, subject }: { email: string; subject: EmailSubjectEnum }): string => {
  return `${UserEmailKey({ email, subject })}::Trails`;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  attachments = [],
}: {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) => {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw new BadRequestException("Invalid recipients");
    }
    if (!html?.length && !text?.length && !attachments?.length) {
      throw new BadRequestException("Invalid content");
    }
    const info = await transporter.sendMail({
      from: `"developer" <${APP_EMAIL}>`,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    });
    console.log("Message sent:%", info.messageId);
    console.log("Preview URL:%", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
    throw new BadRequestException("Invalid SendEmail", { cause: error });
  }
};