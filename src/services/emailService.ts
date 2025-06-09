import OpenAI from 'openai';
import config from '../config';
import { Route, Email } from '../types';
import prompts from '../prompts';

// Documentation: https://github.com/openai/openai-node
const openAIClient = new OpenAI({
  apiKey: config.OPENAI.API_KEY,
});

class EmailService {

    constructor(private readonly openai: OpenAI) {}

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

        if (!emailResponse) {
            throw new Error("Error creating email");
        }

        const email: Email = JSON.parse(emailResponse) as Email;

        console.info("[EmailService] Delay email created:", email);

        return email;
    }

    async _createEmail(prompt: string) {
        console.info("[EmailService] Creating email ...");

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        return response.choices[0].message.content;
    }
}

// Initialize the email service (singleton)
const emailService = new EmailService(openAIClient);

export default emailService;

export { EmailService };