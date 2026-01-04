import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etcc
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
            const info = await transporter.sendMail({
                from: '"Blog-App-Prisma" <prisma@ethereal.email>',
                to: `${user.email}`,
                subject: "Verify your email address",
                text: "Hello world?", // Plain-text version of the message
                html: `<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px;">
    <h2 style="color: #111827;">Verify your email address</h2>

    <p style="color: #374151;">
      Hello <strong>${user.name || "there"}</strong>,
    </p>

    <p style="color: #374151;">
      Thank you for signing up for <strong>Blog App</strong>.  
      Please verify your email address to activate your account.
    </p>

    <div style="margin: 30px 0; text-align: center;">
      <a href="${verificationUrl}"
         style="background-color: #2563eb; color: #ffffff; padding: 12px 24px;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Verify Email
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      If the button doesn’t work, copy and paste this link into your browser:
      <br />
      <a href="${verificationUrl}">${verificationUrl}</a>
    </p>

    <hr style="margin: 30px 0;" />

    <p style="font-size: 13px; color: #9ca3af;">
      This link will expire for security reasons.  
      If you did not create an account, no action is required.
    </p>

    <p style="font-size: 13px; color: #9ca3af;">
      — Blog App Team
    </p>
  </div>
</div>`,
            });

            console.log("Message sent:", info.messageId);
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
            prompt: "select_account consent"
        }
    }
});