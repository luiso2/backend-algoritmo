import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const from = {
      email: this.configService.get<string>('EMAIL_FROM'),
      name: this.configService.get<string>('EMAIL_FROM_NAME'),
    };

    const msg = {
      to,
      from,
      subject,
      text: text || this.htmlToText(html),
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendReminderEmail(
    to: string,
    reminderTitle: string,
    reminderMessage: string,
    actionUrl?: string,
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Algoritmo Finanzas</h1>
            </div>
            <div class="content">
              <h2>${reminderTitle}</h2>
              <p>${reminderMessage}</p>
              ${actionUrl ? `<a href="${actionUrl}" class="button">Ver Detalles</a>` : ''}
            </div>
            <div class="footer">
              <p>© 2024 Algoritmo Finanzas. Todos los derechos reservados.</p>
              <p>Este es un recordatorio automático basado en tus preferencias.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, reminderTitle, html);
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 20px; background-color: #f9f9f9; }
            .features { margin: 20px 0; }
            .feature { margin: 15px 0; padding: 15px; background-color: white; border-radius: 5px; }
            .button { display: inline-block; padding: 14px 28px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Algoritmo Finanzas!</h1>
            </div>
            <div class="content">
              <h2>Hola ${firstName},</h2>
              <p>Estamos emocionados de tenerte con nosotros. Algoritmo Finanzas es tu asistente financiero inteligente que te ayudará a:</p>
              
              <div class="features">
                <div class="feature">
                  <strong>📊 Gestionar tus finanzas</strong>
                  <p>Controla tus ingresos, gastos y presupuestos de manera intuitiva.</p>
                </div>
                <div class="feature">
                  <strong>💳 Optimizar tu crédito</strong>
                  <p>Con Pay Close, nunca más te preocupes por las fechas de corte y pago.</p>
                </div>
                <div class="feature">
                  <strong>🤖 Asistente IA</strong>
                  <p>Recibe consejos personalizados y análisis inteligente de tus finanzas.</p>
                </div>
              </div>
              
              <p>¿Listo para empezar?</p>
              <a href="${this.configService.get('APP_URL')}/dashboard" class="button">Ir a mi Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2024 Algoritmo Finanzas. Todos los derechos reservados.</p>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail(to, '¡Bienvenido a Algoritmo Finanzas!', html);
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
