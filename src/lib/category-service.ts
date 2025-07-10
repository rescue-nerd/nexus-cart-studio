// Category Management Service
// Handles category CRUD operations and caching

import { adminDb } from './firebase-admin';
import admin from 'firebase-admin';
import type { Category, CategoryInput, CategoryUpdate } from './types';

if (!adminDb) {
  throw new Error('Firebase Admin not initialized');
}

const categoriesCollection = adminDb!.collection('categories');

// Helper to convert Firestore doc to a typed object with ID
const docToCategory = (doc: FirebaseFirestore.DocumentSnapshot): Category => {
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
  return { id: doc.id, ...data } as Category;
};

export class CategoryService {
  
  /**
   * Get all categories, optionally filtered by store and active status
   */
  static async getAllCategories(storeId?: string | null, activeOnly: boolean = true): Promise<Category[]> {
    try {
      let query = categoriesCollection.orderBy('displayOrder', 'asc');
      
      if (storeId) {
        query = query.where('storeId', '==', storeId);
      } else {
        query = query.where('storeId', '==', null); // Global categories only
      }
      
      if (activeOnly) {
        query = query.where('isActive', '==', true);
      }
      
      const querySnapshot = await query.get();
      return querySnapshot.docs.map(doc => docToCategory(doc));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get a single category by ID
   */
  static async getCategory(categoryId: string): Promise<Category | null> {
    try {
      const docRef = categoriesCollection.doc(categoryId);
      const docSnap = await docRef.get();
      return docSnap.exists ? docToCategory(docSnap) : null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryData: CategoryInput): Promise<Category> {
    try {
      const newCategoryData = {
        ...categoryData,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      const docRef = await categoriesCollection.add(newCategoryData);
      
      return { 
        id: docRef.id, 
        ...categoryData, 
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update an existing category
   */
  static async updateCategory(categoryId: string, updates: CategoryUpdate): Promise<void> {
    try {
      const docRef = categoriesCollection.doc(categoryId);
      await docRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = categoriesCollection.doc(categoryId);
      await docRef.update({
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Hard delete a category (use with caution)
   */
  static async hardDeleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = categoriesCollection.doc(categoryId);
      await docRef.delete();
    } catch (error) {
      console.error('Error hard deleting category:', error);
      throw new Error('Failed to hard delete category');
    }
  }

  /**
   * Get categories by parent (for hierarchical categories)
   */
  static async getCategoriesByParent(parentCategoryId: string | null, storeId?: string): Promise<Category[]> {
    try {
      let query = categoriesCollection
        .where('parentCategoryId', '==', parentCategoryId)
        .where('isActive', '==', true)
        .orderBy('displayOrder', 'asc');
      
      if (storeId) {
        query = query.where('storeId', '==', storeId);
      } else {
        query = query.where('storeId', '==', null);
      }
      
      const querySnapshot = await query.get();
      return querySnapshot.docs.map(doc => docToCategory(doc));
    } catch (error) {
      console.error('Error fetching categories by parent:', error);
      throw new Error('Failed to fetch categories by parent');
    }
  }

  /**
   * Update product count for a category
   */
  static async updateProductCount(categoryId: string, count: number): Promise<void> {
    try {
      const docRef = categoriesCollection.doc(categoryId);
      await docRef.update({
        productCount: count,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating category product count:', error);
      throw new Error('Failed to update category product count');
    }
  }

  /**
   * Get categories with product counts
   */
  static async getCategoriesWithCounts(storeId?: string | null): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories(storeId, true);
      
      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productsQuery = adminDb!.collection('products')
            .where('category', '==', category.id);
          
          if (storeId) {
            productsQuery.where('storeId', '==', storeId);
          }
          
          const productsSnapshot = await productsQuery.get();
          const productCount = productsSnapshot.size;
          
          return {
            ...category,
            productCount,
          };
        })
      );
      
      return categoriesWithCounts;
    } catch (error) {
      console.error('Error fetching categories with counts:', error);
      throw new Error('Failed to fetch categories with counts');
    }
  }

  /**
   * Check if a category exists and is active
   */
  static async isCategoryActive(categoryId: string): Promise<boolean> {
    try {
      const category = await this.getCategory(categoryId);
      return category?.isActive ?? false;
    } catch (error) {
      console.error('Error checking category status:', error);
      return false;
    }
  }

  /**
   * Get category hierarchy (parent categories)
   */
  static async getCategoryHierarchy(categoryId: string): Promise<Category[]> {
    try {
      const hierarchy: Category[] = [];
      let currentCategory = await this.getCategory(categoryId);
      
      while (currentCategory && currentCategory.parentCategoryId) {
        hierarchy.unshift(currentCategory);
        currentCategory = await this.getCategory(currentCategory.parentCategoryId);
      }
      
      if (currentCategory) {
        hierarchy.unshift(currentCategory);
      }
      
      return hierarchy;
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      throw new Error('Failed to fetch category hierarchy');
    }
  }
}
