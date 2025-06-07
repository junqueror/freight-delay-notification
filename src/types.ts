interface Origin {

    latitude: number;
    longitude: number;
};

interface Destination {
    latitude: number;
    longitude: number;
};

interface Route {
    origin: Origin;
    destination: Destination;
};

export type {
    Origin,
    Destination,
    Route,
};