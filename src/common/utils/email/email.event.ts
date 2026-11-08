import EventEmitter from "events";
import { EmailSubjectEnum } from "../../enum";
import { verifyEmailTemplate } from "./email.template";
import { sendEmail } from "./send.email";

export const emailEvent = new EventEmitter();

emailEvent.on(
  "sendEmail",
  async ({
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    recipients,
    data,
  }: {
    subject?: EmailSubjectEnum;
    recipients: { to?: string[]; cc?: string[]; bcc?: string[] };
    data: any;
  }) => {
    try {
      await sendEmail({ ...recipients, subject, html: verifyEmailTemplate({ subject, title: subject, code: data.code }) });
    } catch (error) {
      console.log(error);
    }
  },
);