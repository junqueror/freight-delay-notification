import { Route } from "./types";

const roundMinutes = (time: number): number => Math.round(time / 60);

const routeToString = (route: Route): {
    textOrigin: string,
    textDestination: string,
} => ({
    textOrigin:`${route.origin.latitude}, ${route.origin.longitude}`,
    textDestination:`${route.destination.latitude}, ${route.destination.longitude}`,
}) 

const formatRecipient = (name: string, email: string): string => `${name} <${email}>`;

export {
    roundMinutes,
    routeToString,
    formatRecipient,
};

