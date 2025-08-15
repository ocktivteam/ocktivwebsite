// emailTransport.js
import nodemailer from "nodemailer";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "ca-central-1",
  // uses AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from env
});

export const mailer = nodemailer.createTransport({
  SES: { ses, aws: { SendRawEmailCommand } },
});
