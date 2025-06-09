import OpenAI from 'openai';
import config from '../config';
import { Email, Route } from '../types';
import prompts from '../prompts';
import { Resend } from 'resend';

// Documentation: https://github.com/openai/openai-node
const openAIClient = new OpenAI({
  apiKey: config.OPENAI.API_KEY,
});

// Documentation: https://resend.com/docs/send-with-nodejs
const resendClient = new Resend(config.RESEND.API_KEY);

// NOTE: SendGrid service for sending emails requires website and domain configuration. 
// Since I have a Resend account already configured I've decided to go with it, 
// by generating an API key for this exercise

class EmailService {

    static OPENAI_CREATE_EMAIL_MODEL: string = config.OPENAI.CREATE_EMAIL_MODEL;

    private readonly fromEmail: string = config.EMAIL.DEFAULT_FROM_EMAIL;

    constructor(
        private readonly openai: OpenAI,
        private readonly resend: Resend,
    ) {
        this.fromEmail = config.EMAIL.DEFAULT_FROM_EMAIL;
    }

    // Craft an email to inform a user about a route delay
    async createDelayedRouteEmail(route: Route, delay: number): Promise<Email> {
        console.info("[EmailService] Creating delay email ...");

        // TODO: Improve it to include directions instead of coordinates (RoutingService)
        const textOrigin: string = `${route.origin.latitude}, ${route.origin.longitude}`;
        const textDestination: string = `${route.destination.latitude}, ${route.destination.longitude}`;

        const prompt = prompts.createDelayedRouteEmail({
            origin: textOrigin, 
            destination: textDestination, 
            delay,
        });

        const emailResponse = await this._createEmail(prompt);

        const email: Email = JSON.parse(emailResponse) as Email;

        console.info("[EmailService] Delay email created:", email);

        return email;
    }

    async _createEmail(prompt: string): Promise<string> {
        console.info("[EmailService] Creating email ...");

        const response = await this.openai.chat.completions.create({
            model: EmailService.OPENAI_CREATE_EMAIL_MODEL,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }, // Enfornce JSON format to split subject and content
        });

        const content = response.choices[0].message.content;

        if (!content) {
            throw new Error("Error creating email");
        }

        return content;
    }

    async sendEmail({
        to,
        subject,
        content,
    }: {
        to: string,
        subject: string,
        content: string,
    }): Promise<void> {
        console.info("[EmailService] Sending email ...");

        const { data, error } = await this.resend.emails.send({
            from: this.fromEmail,
            to,
            subject,
            html: content,
          });
        
        if (error) {
            console.error({ error });
            throw new Error("Error sending email");
        }

        console.log("Type of resend data", typeof data);
        console.log("resend data", data);

        console.info("[EmailService] Email send with id:", data?.id);
    }
}

// Initialize the email service (singleton)
const emailService = new EmailService(openAIClient, resendClient);

export default emailService;

export { EmailService };