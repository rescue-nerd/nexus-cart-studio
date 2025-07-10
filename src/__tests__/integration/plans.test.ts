import { POST as createPlan } from '../../app/api/plans/route';
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
import { getAuthUserFromRequest } from '@/lib/auth-utils';
import type { NextRequest } from 'next/server';

type User = { uid: string; role: string; storeId?: string } | null;

function createMockNextRequest(body: any): NextRequest {
  return {
    json: async () => body,
    url: 'http://localhost/api/plans',
    headers: {},
    cookies: { get: () => undefined },
    nextUrl: { searchParams: new URLSearchParams() },
    // @ts-ignore
    method: 'POST',
  } as unknown as NextRequest;
}

describe('/api/plans RBAC integration', () => {
  const superAdmin: User = { uid: '1', role: 'super_admin' };
  const storeOwner: User = { uid: '2', role: 'store_owner', storeId: 'storeA' };
  const customer: User = { uid: '3', role: 'customer' };
  const unauthenticated: User = null;

  async function testAction(
    action: (req: NextRequest) => Promise<Response>,
    user: User,
    body: any,
    expectedStatus: number,
    expectedSuccess: boolean
  ) {
    (getAuthUserFromRequest as jest.Mock).mockResolvedValue(user);
    const req = createMockNextRequest(body);
    const res = await action(req);
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