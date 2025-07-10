import { requireRole, requireStoreOwnership, AuthUser, requireCategoryWrite, requireOrderRefund, requireUserProfileUpdate } from '../rbac';

const superAdmin: AuthUser = { uid: '1', role: 'super_admin' };
const storeOwner: AuthUser = { uid: '2', role: 'store_owner', storeId: 'storeA' };
const otherStoreOwner: AuthUser = { uid: '3', role: 'store_owner', storeId: 'storeB' };
const staff: AuthUser = { uid: '4', role: 'staff', storeId: 'storeA' };
const customer: AuthUser = { uid: '5', role: 'customer' };
const unauthenticated: AuthUser | null = null;

describe('RBAC Utility', () => {
  describe('Plan creation (super_admin only)', () => {
    it('allows super_admin', () => {
      expect(() => requireRole(superAdmin, 'super_admin')).not.toThrow();
    });
    it('rejects store_owner', () => {
      expect(() => requireRole(storeOwner, 'super_admin')).toThrow('Forbidden');
    });
    it('rejects staff', () => {
      expect(() => requireRole(staff, 'super_admin')).toThrow('Forbidden');
    });
    it('rejects customer', () => {
      expect(() => requireRole(customer, 'super_admin')).toThrow('Forbidden');
    });
    it('rejects unauthenticated', () => {
      expect(() => requireRole(unauthenticated, 'super_admin')).toThrow('Not authenticated');
    });
  });

  describe('Product update (store_owner for their store or super_admin)', () => {
    it('allows super_admin for any store', () => {
      expect(() => requireRole(superAdmin, 'super_admin', 'store_owner')).not.toThrow();
      expect(() => requireStoreOwnership(superAdmin, 'storeA')).not.toThrow();
      expect(() => requireStoreOwnership(superAdmin, 'storeB')).not.toThrow();
    });
    it('allows store_owner for their own store', () => {
      expect(() => requireRole(storeOwner, 'super_admin', 'store_owner')).not.toThrow();
      expect(() => requireStoreOwnership(storeOwner, 'storeA')).not.toThrow();
    });
    it('rejects store_owner for another store', () => {
      expect(() => requireStoreOwnership(storeOwner, 'storeB')).toThrow('Forbidden');
    });
    it('rejects staff', () => {
      expect(() => requireRole(staff, 'super_admin', 'store_owner')).toThrow('Forbidden');
    });
    it('rejects customer', () => {
      expect(() => requireRole(customer, 'super_admin', 'store_owner')).toThrow('Forbidden');
    });
    it('rejects unauthenticated', () => {
      expect(() => requireRole(unauthenticated, 'super_admin', 'store_owner')).toThrow('Not authenticated');
    });
  });

  describe('Order status change (store_owner for their store or super_admin)', () => {
    it('allows super_admin for any store', () => {
      expect(() => requireRole(superAdmin, 'super_admin', 'store_owner')).not.toThrow();
      expect(() => requireStoreOwnership(superAdmin, 'storeA')).not.toThrow();
      expect(() => requireStoreOwnership(superAdmin, 'storeB')).not.toThrow();
    });
    it('allows store_owner for their own store', () => {
      expect(() => requireRole(storeOwner, 'super_admin', 'store_owner')).not.toThrow();
      expect(() => requireStoreOwnership(storeOwner, 'storeA')).not.toThrow();
    });
    it('rejects store_owner for another store', () => {
      expect(() => requireStoreOwnership(storeOwner, 'storeB')).toThrow('Forbidden');
    });
    it('rejects staff', () => {
      expect(() => requireRole(staff, 'super_admin', 'store_owner')).toThrow('Forbidden');
    });
    it('rejects customer', () => {
      expect(() => requireRole(customer, 'super_admin', 'store_owner')).toThrow('Forbidden');
    });
    it('rejects unauthenticated', () => {
      expect(() => requireRole(unauthenticated, 'super_admin', 'store_owner')).toThrow('Not authenticated');
    });
  });

  describe('Privilege escalation attempts', () => {
    it('store_owner cannot create a plan', () => {
      expect(() => requireRole(storeOwner, 'super_admin')).toThrow('Forbidden');
    });
    it('store_owner cannot update another store\'s product', () => {
      expect(() => requireStoreOwnership(storeOwner, 'storeB')).toThrow('Forbidden');
    });
    it('staff cannot update product', () => {
      expect(() => requireRole(staff, 'super_admin', 'store_owner')).toThrow('Forbidden');
    });
  });
});

describe('Category create/edit/delete (store_owner or super_admin)', () => {
  it('allows super_admin for any store', () => {
    expect(() => requireCategoryWrite(superAdmin, 'storeA')).not.toThrow();
    expect(() => requireCategoryWrite(superAdmin, 'storeB')).not.toThrow();
  });
  it('allows store_owner for their own store', () => {
    expect(() => requireCategoryWrite(storeOwner, 'storeA')).not.toThrow();
  });
  it('rejects store_owner for another store', () => {
    expect(() => requireCategoryWrite(storeOwner, 'storeB')).toThrow('Forbidden');
  });
  it('rejects staff', () => {
    expect(() => requireCategoryWrite(staff, 'storeA')).toThrow('Forbidden');
  });
  it('rejects customer', () => {
    expect(() => requireCategoryWrite(customer, 'storeA')).toThrow('Forbidden');
  });
  it('rejects unauthenticated', () => {
    expect(() => requireCategoryWrite(unauthenticated as any, 'storeA')).toThrow();
  });
});

describe('Order refund (super_admin or store_owner for their own store)', () => {
  it('allows super_admin for any store', () => {
    expect(() => requireOrderRefund(superAdmin, 'storeA')).not.toThrow();
    expect(() => requireOrderRefund(superAdmin, 'storeB')).not.toThrow();
  });
  it('allows store_owner for their own store', () => {
    expect(() => requireOrderRefund(storeOwner, 'storeA')).not.toThrow();
  });
  it('rejects store_owner for another store', () => {
    expect(() => requireOrderRefund(storeOwner, 'storeB')).toThrow('Forbidden');
  });
  it('rejects staff', () => {
    expect(() => requireOrderRefund(staff, 'storeA')).toThrow('Forbidden');
  });
  it('rejects customer', () => {
    expect(() => requireOrderRefund(customer, 'storeA')).toThrow('Forbidden');
  });
  it('rejects unauthenticated', () => {
    expect(() => requireOrderRefund(unauthenticated as any, 'storeA')).toThrow();
  });
});

describe('User profile update (user themselves or super_admin)', () => {
  it('allows super_admin for any user', () => {
    expect(() => requireUserProfileUpdate(superAdmin, '1')).not.toThrow();
    expect(() => requireUserProfileUpdate(superAdmin, '2')).not.toThrow();
  });
  it('allows user to update their own profile', () => {
    expect(() => requireUserProfileUpdate(storeOwner, '2')).not.toThrow();
    expect(() => requireUserProfileUpdate(customer, '5')).not.toThrow();
  });
  it('rejects user updating another user profile', () => {
    expect(() => requireUserProfileUpdate(storeOwner, '3')).toThrow('Forbidden');
    expect(() => requireUserProfileUpdate(staff, '2')).toThrow('Forbidden');
  });
  it('rejects unauthenticated', () => {
    expect(() => requireUserProfileUpdate(unauthenticated as any, '2')).toThrow();
  });
}); 