import { Connection, Client } from '@temporalio/client';
import { freightDelayNotification } from './workflows';
import { nanoid } from 'nanoid';
import { TASK_QUEUE_NAME } from './shared';
import process from 'process';

// Configure client request
const name = 'John Doe';
const email = 'john.doe@example.com';

const route = {
  origin: {
      latitude: 41.628401846095095,
      longitude: -4.757610392341808
  },
  destination: {
      latitude: 36.2784207503035,
      longitude: -6.087216903834627,
  },
};

async function run() {

  // Setup Temporal connection and client
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  // Trigger the task
  const handle = await client.workflow.start(freightDelayNotification, {
    taskQueue: TASK_QUEUE_NAME,
    args: [name, email, route],
    workflowId: `freight-delay-notification-${nanoid()}`,
  });

  // Handle result
  const result = await handle.result()
  console.info("Client result: ", result);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});