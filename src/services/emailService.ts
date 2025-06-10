import OpenAI from 'openai';
import config from '../config';
import { Email, Route } from '../types';
import prompts from '../prompts';
import { Resend } from 'resend';
import emailTemplates from '../emailTemplates';
import { EmailServiceError } from '../errors';

// Documentation: https://github.com/openai/openai-node
// Instantiate client to perform requests to OpenAI API
const openAIClient = new OpenAI({
  apiKey: config.OPENAI.API_KEY,
});

// Documentation: https://resend.com/docs/send-with-nodejs
// Instantiate client to perform requests to Resend API
const resendClient = new Resend(config.RESEND.API_KEY);

// NOTE: SendGrid service for sending emails requires website and domain configuration. 
// Since I have a Resend account already configured I've decided to go with it, 
// by generating an API key for this exercise

class EmailService {

    static OPENAI_CREATE_EMAIL_MODEL: string = config.OPENAI.CREATE_EMAIL_MODEL; // Open AI LLM model used to craft emails

    private readonly fromEmail: string = config.EMAIL.DEFAULT_FROM_EMAIL; // Default sender email for the application

    constructor(
        private readonly openai: OpenAI,
        private readonly resend: Resend,
    ) {
        this.fromEmail = config.EMAIL.DEFAULT_FROM_EMAIL; // Set it from default config. Can be modified per instance if needed
    }

    // Craft an email to inform a user about a route delay
    async createDelayedRouteEmail(route: Route, delay: number): Promise<Email> {
        console.info("[EmailService] Creating delay email ...");

        // Prepare data about delayed route to include in the email
        // TODO: Improve it to include addresses instead of coordinates (RoutingService)
        const textOrigin: string = `${route.origin.latitude}, ${route.origin.longitude}`;
        const textDestination: string = `${route.destination.latitude}, ${route.destination.longitude}`;

        // Prepare the prompt to be used to craft the email with OpenAI LLM
        const prompt = prompts.createDelayedRouteEmail({
            origin: textOrigin, 
            destination: textDestination, 
            delay,
        });

        // Create the email with OpenAI client
        const emailResponse = await this._createEmail(prompt);

        try {
            // Parse email to extract subject and content from JSON response
            const email: Email = JSON.parse(emailResponse) as Email;

            console.info("[EmailService] Delay email created:", email);

            return email;
        } catch (error) {
            throw new EmailServiceError(`Error parsing email created from OpenAI API; ${error}`);
        }
    };

    // Create an email to inform a user about a route delay from the default email template
    createDefaultDelayedRouteEmail(route: Route, delay: number): Email {
        // Use default email template with custom data to crete delayed email
        const email: Email = emailTemplates.defaultDelayedRouteEmail(route, delay);

        console.info("[EmailService] Delay email created from template:", email);

        return email;
    };

    // Send and email by using Resend client
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

        // Prepare request data
        const email = {
            from: this.fromEmail,
            to,
            subject,
            html: content,
        };

        // Perform request with API client
        const { data, error } = await this.resend.emails.send(email);
        
        // Get result and handle response errors
        if (error) {
            console.error({ error });
            throw new EmailServiceError(`Error sending email with Resend API: ${error.message}`);
        }

        console.info("[EmailService] Email send with id:", data?.id);
    }

    // Create an email content using OpenAI client
    async _createEmail(prompt: string): Promise<string> {
        console.info("[EmailService] Creating email ...");

        // Perform request with API client
        const response = await this.openai.chat.completions.create({
            model: EmailService.OPENAI_CREATE_EMAIL_MODEL,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }, // Enfornce JSON format to split subject and content
        });

        // Get result and handle empty response errors
        const content = response.choices[0].message.content;

        if (!content) {
            throw new EmailServiceError("Error creating email: OpenAI API response content is empty");
        }

        return content;
    }
}

// Initialize the email service (singleton)
const emailService = new EmailService(openAIClient, resendClient);

export default emailService;

export { EmailService };