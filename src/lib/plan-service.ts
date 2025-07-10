import { adminDb } from './firebase-admin';
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
      let q = query(plansCollection, orderBy('displayOrder', 'asc'));
      
      if (activeOnly) {
        q = query(plansCollection, where('isActive', '==', true), orderBy('displayOrder', 'asc'));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => docToPlan(doc));
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Failed to fetch plans');
    }
  }

  /**
   * Get a single plan by ID
   */
  static async getPlan(planId: string): Promise<Plan | null> {
    try {
      const docRef = doc(plansCollection, planId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docToPlan(docSnap) : null;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw new Error('Failed to fetch plan');
    }
  }

  /**
   * Create a new plan
   */
  static async createPlan(planData: PlanInput): Promise<Plan> {
    try {
      const newPlanData = {
        ...planData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(plansCollection, newPlanData);
      
      return { 
        id: docRef.id, 
        ...planData, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating plan:', error);
      throw new Error('Failed to create plan');
    }
  }

  /**
   * Update an existing plan
   */
  static async updatePlan(planId: string, updates: PlanUpdate): Promise<void> {
    try {
      const docRef = doc(plansCollection, planId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      throw new Error('Failed to update plan');
    }
  }

  /**
   * Delete a plan (soft delete by setting isActive to false)
   */
  static async deletePlan(planId: string): Promise<void> {
    try {
      const docRef = doc(plansCollection, planId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw new Error('Failed to delete plan');
    }
  }

  /**
   * Hard delete a plan (use with caution)
   */
  static async hardDeletePlan(planId: string): Promise<void> {
    try {
      const docRef = doc(plansCollection, planId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error hard deleting plan:', error);
      throw new Error('Failed to hard delete plan');
    }
  }

  /**
   * Get plans by billing cycle
   */
  static async getPlansByBillingCycle(billingCycle: 'monthly' | 'yearly'): Promise<Plan[]> {
    try {
      const q = query(
        plansCollection, 
        where('billingCycle', '==', billingCycle),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => docToPlan(doc));
    } catch (error) {
      console.error('Error fetching plans by billing cycle:', error);
      throw new Error('Failed to fetch plans by billing cycle');
    }
  }

  /**
   * Check if a plan exists and is active
   */
  static async isPlanActive(planId: string): Promise<boolean> {
    try {
      const plan = await this.getPlan(planId);
      return plan?.isActive ?? false;
    } catch (error) {
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
    } catch (error) {
      console.error('Error fetching plan limits:', error);
      return null;
    }
  }
} 