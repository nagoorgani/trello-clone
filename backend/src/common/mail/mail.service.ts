import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('📧 Resend Email Service initialized successfully.');
    } else {
      this.logger.warn('⚠️ RESEND_API_KEY not configured. Falling back to SMTP/mock.');
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`📧 SMTP Mailer configured for host: ${host}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetCode: string): Promise<boolean> {
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'Trello Clone <onboarding@resend.dev>';
    const subject = '🔐 Your Password Reset Code - Trello Clone';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0;">Password Reset Request</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">We received a request to reset your Trello Clone account password.</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px;">Your 6-Digit Verification Code</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #ffffff; padding: 12px 24px; border-radius: 8px; display: inline-block; border: 1px solid #cbd5e1;">
            ${resetCode}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 12px; margin-bottom: 0;">This code is valid for 15 minutes.</p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
          Enter this 6-digit code on the reset password screen to set your new password. If you did not request this, you can safely ignore this email.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} Trello Clone Pro. Built with Next.js & NestJS.
        </p>
      </div>
    `;

    // 1. Try Resend First
    if (this.resend) {
      try {
        const { data, error } = await this.resend.emails.send({
          from,
          to: [to],
          subject,
          html,
        });

        if (error) {
          this.logger.error(`❌ Resend API Error: ${JSON.stringify(error)}`);
        } else {
          this.logger.log(`✅ Password reset email sent via Resend to ${to} (ID: ${data?.id})`);
          return true;
        }
      } catch (err: any) {
        this.logger.error(`❌ Resend dispatch failed: ${err.message}`);
      }
    }

    // 2. Try SMTP Fallback
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        this.logger.log(`✅ Password reset email sent via SMTP to ${to}`);
        return true;
      } catch (err: any) {
        this.logger.error(`❌ SMTP dispatch failed: ${err.message}`);
      }
    }

    // 3. Fallback log for dev inspection
    this.logger.log(`\n======================================================\n📨 [EMAIL DISPATCH LOG]\nTo: ${to}\nSubject: ${subject}\nReset Code: ${resetCode}\n======================================================\n`);
    return true;
  }
}
