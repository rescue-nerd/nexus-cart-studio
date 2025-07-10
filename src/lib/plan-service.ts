import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';
import type { Plan, PlanInput, PlanUpdate } from './types';

if (!adminDb) {
  throw new Error('Firebase Admin not initialized');
}

const plansCollection = adminDb.collection('plans');

// Helper to convert Firestore doc to a typed object with ID
const docToPlan = (doc: FirebaseFirestore.DocumentSnapshot): Plan => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is empty");
  }
  // Convert Timestamps to ISO strings
  for (const key in data) {
    if (data[key]?.toDate) {
      data[key] = data[key].toDate().toISOString();
    }
  }
  return { id: doc.id, ...data } as Plan;
};

export class PlanService {
  /**
   * Get all plans, optionally filtered by active status
   */
  static async getAllPlans(activeOnly: boolean = true): Promise<Plan[]> {
    try {
      let queryRef = plansCollection.orderBy('displayOrder', 'asc');
      if (activeOnly) {
        queryRef = queryRef.where('isActive', '==', true);
      }
      const querySnapshot = await queryRef.get();
      return querySnapshot.docs.map(doc => docToPlan(doc));
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch plans';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error fetching plans:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get a single plan by ID
   */
  static async getPlan(planId: string): Promise<Plan | null> {
    try {
      const docRef = plansCollection.doc(planId);
      const docSnap = await docRef.get();
      return docSnap.exists ? docToPlan(docSnap) : null;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch plan';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error fetching plan:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a new plan
   */
  static async createPlan(planData: PlanInput): Promise<Plan> {
    try {
      const newPlanData = {
        ...planData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await plansCollection.add(newPlanData);
      return {
        id: docRef.id,
        ...planData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      let errorMessage = 'Failed to create plan';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error creating plan:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update an existing plan
   */
  static async updatePlan(planId: string, updates: PlanUpdate): Promise<void> {
    try {
      const docRef = plansCollection.doc(planId);
      await docRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: unknown) {
      let errorMessage = 'Failed to update plan';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error updating plan:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a plan (soft delete by setting isActive to false)
   */
  static async deletePlan(planId: string): Promise<void> {
    try {
      const docRef = plansCollection.doc(planId);
      await docRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete plan';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error deleting plan:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Hard delete a plan (use with caution)
   */
  static async hardDeletePlan(planId: string): Promise<void> {
    try {
      const docRef = plansCollection.doc(planId);
      await docRef.delete();
    } catch (error: unknown) {
      let errorMessage = 'Failed to hard delete plan';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error hard deleting plan:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get plans by billing cycle
   */
  static async getPlansByBillingCycle(billingCycle: 'monthly' | 'yearly'): Promise<Plan[]> {
    try {
      const queryRef = plansCollection
        .where('billingCycle', '==', billingCycle)
        .where('isActive', '==', true)
        .orderBy('displayOrder', 'asc');
      const querySnapshot = await queryRef.get();
      return querySnapshot.docs.map(doc => docToPlan(doc));
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch plans by billing cycle';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Error fetching plans by billing cycle:', error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if a plan exists and is active
   */
  static async isPlanActive(planId: string): Promise<boolean> {
    try {
      const plan = await this.getPlan(planId);
      return plan?.isActive ?? false;
    } catch (error: unknown) {
      console.error('Error checking plan status:', error);
      return false;
    }
  }

  /**
   * Get plan limits for feature checking
   */
  static async getPlanLimits(planId: string): Promise<Plan['limits'] | null> {
    try {
      const plan = await this.getPlan(planId);
      return plan?.limits ?? null;
    } catch (error: unknown) {
      console.error('Error fetching plan limits:', error);
      return null;
    }
  }
} 