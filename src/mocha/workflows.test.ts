import { TestWorkflowEnvironment } from '@temporalio/testing';
import { after, before, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import { freightDelayNotification } from '../workflows';
import assert from 'assert';
import { Email, Route } from '../types';

describe('Freight Delay Notification', () => {
    let testEnv: TestWorkflowEnvironment;
  
    before(async () => {
      testEnv = await TestWorkflowEnvironment.createLocal();
    });
  
    after(async () => {
      await testEnv?.teardown();
    });
  
    it('successfully completes the Workflow with route delay', async () => {
      // Setup: test data, activity mocks and expected result
      const { client, nativeConnection } = testEnv;
      const taskQueue = 'test';

      // Arguments
      const name = 'Name';
      const email = 'email@email.com'
      const route = {
        origin: {
            latitude: 0,
            longitude: 0
        },
        destination: {
            latitude: 0,
            longitude: 0,
        },
      };
  
      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue,
        workflowsPath: require.resolve('../workflows'),
        activities: {
          getDelay: async (_route: Route): Promise<number> => 2722,
          checkDelay: async (_delay: number): Promise<boolean> => true,
          createEmail: async (_route: Route, _delay: number): Promise<Email> => ({
            subject: 'subject',
            content: '<html><p>content</p></html>',
          }),
          createDefaultEmail: async (_route: Route, _delay: number): Promise<Email> => ({
            subject: 'subject',
            content: '<html><p>content</p></html>',
          }),
          sendEmail: async (_email: Email): Promise<void> => {},
        },
      });

      const expectedResult = 'Freight delay notification email sent to \'Name <email@email.com>\'';
  
      // Execution: Run workflow
      const result = await worker.runUntil(
        client.workflow.execute(freightDelayNotification, {
          args: [name, email, route],
          workflowId: 'test',
          taskQueue,
        })
      );

      // Assertions: Check workflow completed
      assert.equal(result, expectedResult);
    });

    it('successfully completes the Workflow without route delay', async () => {
      // Setup: test data, activity mocks and expected result
      const { client, nativeConnection } = testEnv;
      const taskQueue = 'test';

      // Arguments
      const name = 'Name';
      const email = 'email@email.com'
      const route = {
        origin: {
            latitude: 0,
            longitude: 0
        },
        destination: {
            latitude: 0,
            longitude: 0,
        },
      };
  
      const worker = await Worker.create({
        connection: nativeConnection,
        taskQueue,
        workflowsPath: require.resolve('../workflows'),
        activities: {
          getDelay: async (_route: Route): Promise<number> => 0,
          checkDelay: async (_delay: number): Promise<boolean> => false,
          createEmail: async (_route: Route, _delay: number): Promise<Email> => ({
            subject: 'subject',
            content: '<html><p>content</p></html>',
          }),
          createDefaultEmail: async (_route: Route, _delay: number): Promise<Email> => ({
            subject: 'subject',
            content: '<html><p>content</p></html>',
          }),
          sendEmail: async (_email: Email): Promise<void> => {},
        },
      });

      const expectedResult = 'No freight delay. Email notification skipped';
  
      // Execution: Run workflow
      const result = await worker.runUntil(
        client.workflow.execute(freightDelayNotification, {
          args: [name, email, route],
          workflowId: 'test',
          taskQueue,
        })
      );

      // Assertions: Check workflow exited skipping email
      assert.equal(result, expectedResult);
    });
  });
  