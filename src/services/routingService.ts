import { RoutesClient } from "@googlemaps/routing";
import config from "../config";
import { Coordinates, Destination, Origin } from "../types";

// Documentation: https://github.com/googleapis/google-cloud-node/tree/main/packages/google-maps-routing
const routingClient = new RoutesClient({
    apiKey: config.GOOGLE_ROUTING.API_KEY,
});

class RoutingService {

    private readonly delayThreshold: number;

    constructor(private readonly routingClient: RoutesClient) {
        this.delayThreshold = config.ROUTING.DELAY_THRESHOLD;
    }

    // Calculate the delay of a route (seconds) for a given origin and destination
    async getRouteDelay(origin: Origin, destination: Destination): Promise<number> {
        console.info("[RoutingService] Calculating if the route from", origin, "to", destination, "has a delay...");

        const route = await this._getRoute(origin, destination);

        const standardDuration: number = route.duration?.seconds ? Number(route.duration.seconds) : 0;
        const trafficDuration: number = route.staticDuration?.seconds ? Number(route.staticDuration.seconds) : 0;

        console.info("[RoutingService] Route standard duration:", standardDuration, "seconds");
        console.info("[RoutingService] Route with traffic duration:", trafficDuration, "seconds");

        if (!standardDuration || !trafficDuration) {
            throw new Error("No route duration found");
        }

        const delay = trafficDuration - standardDuration;

        return delay;
    }

    // Check if a route has a delay greater than the threshold
    checkRouteHasDelay(delay: number): boolean {
        const hasDelay = delay > this.delayThreshold;

        console.info("[RoutingService] Route has delay?:", hasDelay);

        return hasDelay;
    }

    // Retrieve latitude and longitude 
    getCoordinatesFromAddress(address: string): Coordinates {
        // TODO: Use Google Geocoding API to convert from address to location coordinates
        // https://developers.google.com/maps/documentation/geocoding/overview
        throw Error("Not implemented");
    }

    async _getRoute(origin: Origin, destination: Destination) {
        console.info("[RoutingService] Calculating route from", origin, "to", destination, " ...");

        const request = {
            origin: {
                location: {
                    latLng: {
                        latitude: origin.latitude,
                        longitude: origin.longitude,
                    },
                },
            },
            destination: {
                location: {
                    latLng: {
                        latitude: destination.latitude,
                        longitude: destination.longitude,
                    },
                },
            },
        };
        
        const options = {
            otherArgs: {
                headers: {'X-Goog-Fieldmask': '*'}
            }
        } as any;

        const response = await this.routingClient.computeRoutes(request, options);

        if (!response?.length) {
            throw new Error("No routes found");
        }

        const routes = response[0].routes;

        if (!routes) {
            throw new Error("No routes found");
        }

        const mainRoute = routes[0];

        return mainRoute;
    }
}

// Initialize the routing service (singleton)
const routingService = new RoutingService(routingClient);

export default routingService;

export { RoutingService };