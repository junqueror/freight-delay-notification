const roundMinutes = (time: number): number => Math.round(time / 60);

const formatRecipient = (name: string, email: string): string => `${name} <${email}>`;

export {
    roundMinutes,
    formatRecipient,
};

