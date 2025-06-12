// Add Activity Definitions here.

import emailService from "./services/emailService";
import routingService from "./services/routingService";
import { Email, EmailWithRecipient, Route } from "./types";

// Declare activities

// in order to call service methods, we need to create new functions that do not depend on service instance and convert everythong to async (required by activities)

const getDelay = async (route: Route): Promise<number> => routingService.getRouteDelay(route.origin, route.destination);

const checkDelay = async (delay: number): Promise<boolean> => routingService.checkRouteHasDelay(delay);

const createEmail = async (route: Route, delay: number): Promise<Email> => emailService.createDelayedRouteEmail(route, delay);

const createDefaultEmail = async (route: Route, delay: number): Promise<Email> => emailService.createDefaultDelayedRouteEmail(route, delay);

const sendEmail = async (email: EmailWithRecipient): Promise<void> => emailService.sendEmail(email);

// Export activities

export {
  getDelay,
  checkDelay,
  createEmail,
  createDefaultEmail,
  sendEmail,
};


