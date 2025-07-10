import { POST as createPlan, PUT as updatePlan, DELETE as deletePlan } from '../../app/api/plans/route';
jest.mock('@/lib/plan-service', () => ({
  PlanService: {
    createPlan: jest.fn().mockResolvedValue({ id: 'mock-plan', name: 'Test Plan', price: 1000 }),
    updatePlan: jest.fn().mockResolvedValue({ id: 'mock-plan', name: 'Updated Plan', price: 2000 }),
    deletePlan: jest.fn().mockResolvedValue(true),
  },
}));
jest.mock('@/lib/auth-utils', () => ({
  getAuthUserFromRequest: jest.fn(),
}));
const { getAuthUserFromRequest } = require('@/lib/auth-utils');

describe('/api/plans RBAC integration', () => {
  const superAdmin = { uid: '1', role: 'super_admin' };
  const storeOwner = { uid: '2', role: 'store_owner', storeId: 'storeA' };
  const customer = { uid: '3', role: 'customer' };
  const unauthenticated = null;

  function mockRequest(body: any) {
    return {
      json: async () => body,
      url: 'http://localhost/api/plans',
    };
  }

  async function testAction(action: any, user: any, body: any, expectedStatus: number, expectedSuccess: boolean) {
    getAuthUserFromRequest.mockResolvedValue(user);
    const req = mockRequest(body);
    const res = await action(req as any);
    const data = await res.json();
    expect(res.status).toBe(expectedStatus);
    expect(data.success).toBe(expectedSuccess);
  }

  describe('Plan creation', () => {
    it('allows super_admin', async () => {
      await testAction(createPlan, superAdmin, { name: 'Test Plan', price: 1000 }, 201, true);
    });
    it('denies store_owner', async () => {
      await testAction(createPlan, storeOwner, { name: 'Test Plan', price: 1000 }, 500, false);
    });
    it('denies customer', async () => {
      await testAction(createPlan, customer, { name: 'Test Plan', price: 1000 }, 500, false);
    });
    it('denies unauthenticated', async () => {
      await testAction(createPlan, unauthenticated, { name: 'Test Plan', price: 1000 }, 500, false);
    });
  });

  // Extend for update and delete as needed
  // Example:
  // describe('Plan update', ...)
  // describe('Plan delete', ...)
});

// To extend for other endpoints:
// 1. Import the handler (e.g., POST/PUT/DELETE from the API route)
// 2. Mock the service and auth context as above
// 3. Use testAction to simulate each role
// 4. Assert only allowed roles succeed 