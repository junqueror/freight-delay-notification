
interface Prompts {
    [key: string]: (...args: any[]) => string;
}

const prompts: Prompts = {
    createDelayedRouteEmail: ({origin, destination, delay }: {origin: string, destination: string, delay: number }) => `
        You are a helpful assistant that creates an email to inform user about routing and deliveries.

        You're part of a notification system for delayed freight deliveries.

        Create a short notification email to inform the user and apologize for the inconvenience. 
        The email tone should be human, friendly, but also professional.
        It should include the following data:
        - Origin: {{origin}}
        - Destination: {{destination}}
        - Route delay: {{delay}} seconds
        Convert the delay to the following format: DD days, HH hours, MM minutes (think about what's best for the user, including only necessary ones and never incldue seconds)

        Your email response must be only a JSON object in the following format:
        {
            "subject": "string",
            "body": "string"
        }
        `.replace("{{origin}}", origin)
        .replace("{{destination}}", destination)
        .replace("{{delay}}", String(delay)),
};

export default prompts;