class RoutingServiceError extends Error {
    constructor(message: string, public readonly originalError?: any) {
        super(message);
    }
};

class EmailServiceError extends Error {
    constructor(message: string, public readonly originalError?: any) {
        super(message);
    }
};

export {
    RoutingServiceError,
    EmailServiceError,
}