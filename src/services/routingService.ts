import { RoutesClient } from "@googlemaps/routing";
import config from "../config";
import { Coordinates, Destination, Origin } from "../types";
import { RoutingServiceError } from "../errors";

// Documentation: https://github.com/googleapis/google-cloud-node/tree/main/packages/google-maps-routing
// Instantiate client to perform requests to Google Routing API
const routingClient = new RoutesClient({
    apiKey: config.GOOGLE_ROUTING.API_KEY,
});

class RoutingService {

    private readonly delayThreshold: number; // Min number of minutes on a delay to send an email notification

    constructor(private readonly routingClient: RoutesClient) {
        this.delayThreshold = config.ROUTING.MIN_DELAY_TO_NOTIFICATION; // Set it from default config. Can be modified per instance if needed
    }

    // Calculate the delay of a route (seconds) for a given origin and destination
    async getRouteDelay(origin: Origin, destination: Destination): Promise<number> {
        console.info("[RoutingService] Calculating if the route from", origin, "to", destination, "has a delay...");

        // Get the route object from the API
        const route = await this._getRoute(origin, destination);

        // Retrieve just duration data with and without traffic
        const standardDuration: number = route.duration?.seconds ? Number(route.duration.seconds) : 0;
        const trafficDuration: number = route.staticDuration?.seconds ? Number(route.staticDuration.seconds) : 0;

        console.info("[RoutingService] Route standard duration:", standardDuration, "seconds");
        console.info("[RoutingService] Route with traffic duration:", trafficDuration, "seconds");

        // Handle errors if there is no data
        if (!standardDuration) {
            throw new RoutingServiceError("Error retrieving routing data from Google Routing API: No standard route duration retrieved");
        }

        if (!trafficDuration) {
            throw new RoutingServiceError("Error retrieving routing data from Google Routing API: No traffic route duration retrieved");
        }

        // Calculate delay on the route with traffic
        const delay = trafficDuration - standardDuration;

        return delay;
    }

    // Check if a route has a delay greater than the threshold
    checkRouteHasDelay(delay: number): boolean {
        // Check if delay time is enough to be considered, by comparing with defiend threshold
        const hasDelay = delay > this.delayThreshold;

        console.info("[RoutingService] Route has delay?:", hasDelay);

        return hasDelay;
    }

    // Retrieve latitude and longitude 
    getCoordinatesFromAddress(_address: string): Coordinates {
        // TODO: Use Google Geocoding API to convert from address to location coordinates
        // https://developers.google.com/maps/documentation/geocoding/overview
        throw new RoutingServiceError("Not implemented");
    }

    // Retrieve a route object fro mthe Google Routing API
    async _getRoute(origin: Origin, destination: Destination) {
        console.info("[RoutingService] Calculating route from", origin, "to", destination, " ...");

        // Prepare request data
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

        // Prepare options
        const options = {
            otherArgs: {
                headers: { 'X-Goog-Fieldmask': '*' }, // Retrieve all data // TODO: This can be improved to retrieve only specific and required data
            }
        } as any;

        // Perform request with API client
        const response = await this.routingClient.computeRoutes(request, options);

        // Get route result and handle empty response errors
        if (!response?.length) {
            throw new RoutingServiceError("Error retrieving routing data from Google Routing API: No responses retrieved");
        }

        const routes = response[0].routes;

        if (!routes) {
            throw new RoutingServiceError("Error retrieving routing data from Google Routing API: No routes retrieved");
        }

        const mainRoute = routes[0];

        return mainRoute;
    }
}

// Initialize the routing service (singleton)
const routingService = new RoutingService(routingClient);

export default routingService;

export { RoutingService };