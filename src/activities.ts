// Add Activity Definitions here.

import emailService from "./services/emailService";
import routingService from "./services/routingService";
import { Email, EmailWithRecipient, Route } from "./types";
import { roundMinutes } from "./utils";

const getRouteDelay = async (route: Route): Promise<number> => {
    const delaySecs = await routingService.getRouteDelay(route.origin, route.destination);

    const delayMins = roundMinutes(delaySecs);

    return delayMins
};

const checkDelay = async (delay: number): Promise<boolean> => {
  const hasDelay = routingService.checkRouteHasDelay(delay);

  return hasDelay;
};

const createDelayedRouteEmail = async (route: Route, delay: number): Promise<Email> => {
  const email = await emailService.createDelayedRouteEmail(
    route,
    delay,
  );

  return email;
};

const sendDelayedRouteEmail = async (email: EmailWithRecipient): Promise<string> => {
  await emailService.sendEmail({
      to: email.to,
      subject: email.subject,
      content: email.content,
  });

  return "Delayed Route email sent to "
};

export {
  getRouteDelay,
  checkDelay,
  createDelayedRouteEmail,
  sendDelayedRouteEmail,
};


