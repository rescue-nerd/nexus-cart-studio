import { POST } from '../app/api/plans/route';
jest.mock('../lib/auth-utils', () => ({
  getAuthUserFromRequest: jest.fn(),
}));
const { getAuthUserFromRequest } = require('../lib/auth-utils');

describe('/api/plans RBAC integration', () => {
  const superAdmin = { uid: '1', role: 'super_admin' };
  const storeOwner = { uid: '2', role: 'store_owner', storeId: 'storeA' };

  function mockRequest(body: any) {
    return {
      json: async () => body,
      url: 'http://localhost/api/plans',
    };
  } 

  it('allows super_admin to create a plan', async () => {
    getAuthUserFromRequest.mockResolvedValue(superAdmin);
    const req = mockRequest({ name: 'Test Plan', price: 1000 });
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('rejects store_owner from creating a plan (bad actor)', async () => {
    getAuthUserFromRequest.mockResolvedValue(storeOwner);
    const req = mockRequest({ name: 'Evil Plan', price: 1000 });
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(500); // RBAC throws, caught as 500
    expect(data.success).toBe(false);
  });
}); 