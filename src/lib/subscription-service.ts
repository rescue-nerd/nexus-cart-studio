// Subscription and Plan Management Service
// Handles plan upgrades, billing cycles, and feature restrictions

import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';
import { Plan } from './types';

export interface Subscription {
  id: string;
  storeId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPayment?: Date;
  nextBilling?: Date;
}

export class SubscriptionService {
  
  // Get all available plans from database
  static async getAvailablePlans(): Promise<Plan[]> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      const snapshot = await adminDb
        .collection('plans')
        .where('isActive', '==', true)
        .orderBy('displayOrder')
        .get();
      
      const plans: Plan[] = [];
      snapshot.forEach(doc => {
        plans.push({ id: doc.id, ...doc.data() } as Plan);
      });

      return plans;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Failed to fetch plans');
    }
  }

  // Get plan by ID from database
  static async getPlanById(planId: string): Promise<Plan | null> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      const planDoc = await adminDb.collection('plans').doc(planId).get();
      
      if (!planDoc.exists) {
        return null;
      }

      return { id: planDoc.id, ...planDoc.data() } as Plan;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw new Error('Failed to fetch plan');
    }
  }
  
  static async getStorePlan(storeId: string): Promise<{ plan: Plan; subscription?: Subscription }> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      const storeRef = adminDb.collection('stores').doc(storeId);
      const storeDoc = await storeRef.get();
      
      if (!storeDoc.exists) {
        throw new Error('Store not found');
      }

      const storeData = storeDoc.data();
      const planId = storeData?.planId || 'starter';
      
      // Get plan from database
      const plan = await this.getPlanById(planId);
      if (!plan) {
        // Fallback to starter plan if current plan not found
        const defaultPlan = await this.getPlanById('starter');
        if (!defaultPlan) {
          throw new Error('Default starter plan not found');
        }
        return { plan: defaultPlan };
      }

      // Get active subscription if exists
      const subscriptionSnapshot = await adminDb
        .collection('subscriptions')
        .where('storeId', '==', storeId)
        .where('status', '==', 'active')
        .get();
      
      let subscription: Subscription | undefined;
      
      if (!subscriptionSnapshot.empty) {
        const subDoc = subscriptionSnapshot.docs[0];
        subscription = { id: subDoc.id, ...subDoc.data() } as Subscription;
      }

      return { plan, subscription };

    } catch (error) {
      console.error('Error fetching store plan:', error);
      throw new Error('Failed to fetch store plan');
    }
  }

  static async checkPlanLimits(storeId: string): Promise<{
    plan: Plan;
    usage: {
      products: number;
      orders: number;
      storage: number;
    };
    withinLimits: {
      products: boolean;
      orders: boolean;
      storage: boolean;
    };
  }> {
    const { plan } = await this.getStorePlan(storeId);
    
    // Get current usage
    const [productsSnapshot, ordersSnapshot] = await Promise.all([
      adminDb!.collection('products').where('storeId', '==', storeId).get(),
      adminDb!.collection('orders').where('storeId', '==', storeId).get()
    ]);

    const usage = {
      products: productsSnapshot.size,
      orders: ordersSnapshot.size,
      storage: 0 // TODO: Calculate actual storage usage
    };

    const withinLimits = {
      products: plan.limits.maxProducts === -1 || usage.products <= plan.limits.maxProducts,
      orders: plan.limits.maxOrders === -1 || usage.orders <= plan.limits.maxOrders,
      storage: usage.storage <= plan.limits.maxStorage
    };

    return { plan, usage, withinLimits };
  }

  static async upgradePlan(storeId: string, newPlanId: string): Promise<void> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const newPlan = await this.getPlanById(newPlanId);
    if (!newPlan) {
      throw new Error('Invalid plan ID');
    }

    try {
      // Update store's plan
      const storeRef = adminDb.collection('stores').doc(storeId);
      await storeRef.update({
        planId: newPlanId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create new subscription record
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

      const subscription: Partial<Subscription> = {
        storeId,
        planId: newPlanId,
        status: 'active',
        startDate: admin.firestore.Timestamp.fromDate(startDate) as any,
        endDate: admin.firestore.Timestamp.fromDate(endDate) as any,
        autoRenew: true
      };

      await adminDb.collection('subscriptions').add(subscription);

      // In a real implementation, you'd integrate with a payment processor here
      console.log(`Plan upgraded for store ${storeId} to ${newPlan.name}`);

    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw new Error('Failed to upgrade plan');
    }
  }

  static async checkFeatureAccess(storeId: string, feature: keyof Plan['limits']): Promise<boolean> {
    const { plan } = await this.getStorePlan(storeId);
    return plan.limits[feature] === true || plan.limits[feature] === -1;
  }

  static canAddProduct(plan: Plan, currentCount: number): boolean {
    return plan.limits.maxProducts === -1 || currentCount < plan.limits.maxProducts;
  }

  static canUseAIFeatures(plan: Plan): boolean {
    return plan.limits.aiFeatures;
  }

  static canUseCustomDomain(plan: Plan): boolean {
    return plan.limits.customDomain;
  }
}
