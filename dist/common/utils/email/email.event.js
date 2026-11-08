"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const events_1 = __importDefault(require("events"));
const enum_1 = require("../../enum");
const email_template_1 = require("./email.template");
const send_email_1 = require("./send.email");
exports.emailEvent = new events_1.default();
exports.emailEvent.on("sendEmail", async ({ subject = enum_1.EmailSubjectEnum.CONFIRM_EMAIL, recipients, data, }) => {
    try {
        await (0, send_email_1.sendEmail)({ ...recipients, subject, html: (0, email_template_1.verifyEmailTemplate)({ subject, title: subject, code: data.code }) });
    }
    catch (error) {
        console.log(error);
    }
});
