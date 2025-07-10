import { POST } from '../app/api/plans/route';
jest.mock('../lib/auth-utils', () => ({
  getAuthUserFromRequest: jest.fn(),
}));
import { getAuthUserFromRequest } from '../lib/auth-utils';
import type { NextRequest } from 'next/server';

interface MockRequest {
  json: () => Promise<any>;
  url: string;
  headers: any;
  cookies: any;
  nextUrl: any;
}

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
  const superAdmin = { uid: '1', role: 'super_admin' };
  const storeOwner = { uid: '2', role: 'store_owner', storeId: 'storeA' };

  it('allows super_admin to create a plan', async () => {
    (getAuthUserFromRequest as jest.Mock).mockResolvedValue(superAdmin);
    const req = createMockNextRequest({ name: 'Test Plan', price: 1000 });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('rejects store_owner from creating a plan (bad actor)', async () => {
    (getAuthUserFromRequest as jest.Mock).mockResolvedValue(storeOwner);
    const req = createMockNextRequest({ name: 'Evil Plan', price: 1000 });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(500); // RBAC throws, caught as 500
    expect(data.success).toBe(false);
  });
}); 