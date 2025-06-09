import dotenv from "dotenv";

dotenv.config();

// Third party

const GOOGLE_ROUTING = {
    API_KEY: process.env.GOOGLE_ROUTING_API_KEY || '',
};

const OPENAI = {
    API_KEY: process.env.OPENAI_API_KEY || '',
    CREATE_EMAIL_MODEL: "gpt-4o-mini",
};

const RESEND = {
    API_KEY: process.env.RESEND_API_KEY,
};

// Buussiness logic 

const ROUTING = {
    DELAY_THRESHOLD: 30, // minutes
};

const EMAIL = {
    DEFAULT_FROM_EMAIL: process.env.DEFAULT_FROM_EMAIL || '',
};

const config = {
    GOOGLE_ROUTING,
    OPENAI,
    RESEND,
    ROUTING,
    EMAIL,
};

export default config;