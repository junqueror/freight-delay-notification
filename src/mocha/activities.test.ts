import { MockActivityEnvironment } from '@temporalio/testing';
import { describe, it } from 'mocha';
import * as activities from '../activities';
import assert from 'assert';
import sinon from 'sinon';
import routingService from '../services/routingService';

describe('getRouteDelay activity', async () => {
  let getRouteDelayStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub the method on the actual singleton instance
    getRouteDelayStub = sinon.stub(routingService, 'getRouteDelay');
  });

  afterEach(() => {
    // Restore all stubs after each test
    sinon.restore();
  });

  it('successfully gets the delay in minutes', async () => {
    // Setup: test data, mocks and expected result
    const route = {
      origin: {
        latitude: 41.628401846095095,
        longitude: -4.757610392341808
      },
      destination: {
        latitude: 40.417290280045556,
        longitude: -3.688807707768146,
      },
    };
    const expectedDelaySeconds = 1320; // 22 minutes in seconds
    const expectedDelayMinutes = 22; // minutes

    // Mock the routing service to return delay in seconds
    getRouteDelayStub.resolves(expectedDelaySeconds);

    // Execution: Run getRouteDelay activity
    const env = new MockActivityEnvironment();
    const delay = await env.run(activities.getRouteDelay, route);

    // Assertions: Check mock called and retrieved delay in minutes
    assert(getRouteDelayStub.calledOnce);
    assert(getRouteDelayStub.calledWithExactly(route.origin, route.destination));
    assert.strictEqual(delay, expectedDelayMinutes);
  });
});

// TODO: Add more cases and tests for the rest of activities
