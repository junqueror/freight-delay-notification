
interface Coordinates {
    latitude: number;
    longitude: number;
}

type Origin = Coordinates;

type Destination = Coordinates;

interface Route {
    origin: Origin;
    destination: Destination;
};

interface Email {
    subject: string,
    content: string,
}

export type {
    Coordinates,
    Origin,
    Destination,
    Route,
    Email,
};