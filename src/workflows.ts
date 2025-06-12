// Add Workflow Definitions here.

import * as workflow from '@temporalio/workflow';
import { log } from '@temporalio/workflow';
import type * as activities from './activities';
import { Route, EmailWithRecipient, Email } from './types';
import { formatRecipient, roundMinutes } from './utils';

// Load Activities and assign the Retry Policy
const { 
  getDelay, 
  checkDelay, 
  createEmail,
  createDefaultEmail, 
  sendEmail,
 } = workflow.proxyActivities<typeof activities>({
  retry: {
    initialInterval: '10 seconds', // amount of time that must elapse before the first retry occurs.
    maximumInterval: '30 seconds', // maximum interval between retries.
    backoffCoefficient: 2, // how much the retry interval increases.
    maximumAttempts: 5, // maximum number of execution attempts. Unspecified means unlimited retries.
  },
  startToCloseTimeout: '1 minute', // maximum time allowed for a single Activity Task Execution.
});

// The Temporal Workflow.
const freightDelayNotification = async (
  name: string,
  emailAddress: string, 
  route: Route,
): Promise<string> => {
    // ROUTING

    let delay: number; // minutes

    try {
      // TODO: Modify workflow to handle route addresses instad of coordinates to improve UX
      // This can be done with RoutingService.getCoordinatesFromAddress() or similar method and a new activity

      // Get delay (minutes) for the specified routes
      delay = roundMinutes(await getDelay(route));
      log.info("[Workflow]: Route delay:", { delay, units: "minutes" });

      // Check id delay is over the delay notification threshold
      const hasDelay = await checkDelay(delay);
      log.info("[Workflow]: Route has delay?", { hasDelay });

      // Finish workflow if there is no significant delay
      if (!hasDelay) {
        log.info("[Workflow]: Finishing workflow");
        return "No freight delay. Email notification skipped";
      }

    } catch (error) {
      log.error("Failed to calculate route delay", { error });

      // Finish workflow with error if it was not possible to calculate the delay
      throw new workflow.ApplicationFailure("Failed to calculate freight delay");
    }

    // EMAIL

    // There is significant delay
    // Prepare email to sent
    let email: Email;

    try {
        email = await createEmail(
          route,
          delay,
      );
    } catch (error) {
        log.warn("Failed to create delay email", { error });

        // NOTE: Better handle this logic here than in the service itself, since it's related with how the application works, not with the email sending responsibility
        // Depending on the business logic, we might want to include error handling and fallback functionaliity in the activity
        // I'd also need to know more about Temporalio, but without knowing mroe I thin kthe best option is to keep everything separated in small steps (activities)
        try {
            // In case there is an error creating the email with Open AI, create a default one from template
            email = await createDefaultEmail(route, delay);
        } catch (error) {
            log.error("Failed to create delay email", { error });

            // Finish workflow with error if it was not possible to create the email
            throw new workflow.ApplicationFailure("Failed to create freight delay email");
        }
    }
    log.info("[Workflow]: Email created:", { email });

    // Add recipient to the email structure
    const emailWithRecipient: EmailWithRecipient = {
        ...email,
        to: formatRecipient(name, emailAddress), // Recipient format "Name <email>"
    };

    try {
        // Send the delayed route email notification to the recepient email
        await sendEmail(emailWithRecipient);
        log.info(`[Workflow]:
            Freight delay notification email sent to '${emailWithRecipient.to}'
              
            [${email.subject}]

            ${email.content}
        `);

        return `Freight delay notification email sent to '${emailWithRecipient.to}'`;
    } catch (error) {
        log.error("Failed to send freight delay notification email", { error });

        // Finish workflow with error if it was not possible to send the email
        throw new workflow.ApplicationFailure("Failed to send freight delay notification email");

        // TODO: We could add here a fallback flow to send a phone SMS instead, 
        // using a new activity and a PhoneService with OpenAI model to create SMS and Twilio for sending (similar to email one)
    }
};

export {
  freightDelayNotification
};
