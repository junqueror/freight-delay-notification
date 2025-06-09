import dotenv from "dotenv";

dotenv.config();

const ROUTING = {
    GOOGLE_ROUTING_API_KEY: process.env.GOOGLE_ROUTING_API_KEY,
    DELAY_THRESHOLD: 1800, // 30 mins (seconds)
};

const OPENAI = {
    API_KEY: process.env.OPENAI_API_KEY,
};

const config = {
    ROUTING,
    OPENAI,
};

export default config;