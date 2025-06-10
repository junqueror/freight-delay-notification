import { Email } from "./types";

interface EmailTemplates {
    [key: string]: (...args: any[]) => Email;
}

const emailTemplates: EmailTemplates = {
    defaultDelayedRouteEmail: ({origin, destination, delay }: {origin: string, destination: string, delay: number }): Email => ({
        subject: "Important Update on Your Freight Delivery",
        content: `
        Dear User,
        
        We hope this message finds you well. We want to inform you about a delay in your freight delivery.
        
        Origin: ${origin}
        Destination: ${destination}
        Route Delay: ${delay} minutes
        
        We sincerely apologize for any inconvenience this may cause and appreciate your understanding in this matter. We are working diligently to resolve the issue and get your delivery back on track.
        
        Thank you for your patience!
        
        Best regards,
        The Freight Team
                `.replace("{{origin}}", origin)
                .replace("{{destination}}", destination)
                .replace("{{delay}}", String(delay)),
}),
};

export default emailTemplates;