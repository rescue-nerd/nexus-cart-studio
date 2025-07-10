// Category Management Service
// Handles category CRUD operations and caching

import { adminDb } from './firebase-admin';
import { Category } from './types';

export class CategoryService {
  
  // Get all categories for a store (includes global categories)
  static async getCategories(storeId?: string, includeInactive = false): Promise<Category[]> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      let query = adminDb.collection('categories');
      
      // Filter by store (global categories have no storeId)
      if (storeId) {
        query = query.where('storeId', 'in', [storeId, null]) as any;
      } else {
        query = query.where('storeId', '==', null) as any;
      }

      // Filter by active status
      if (!includeInactive) {
        query = query.where('isActive', '==', true) as any;
      }

      // Order by display order
      query = query.orderBy('displayOrder') as any;

      const snapshot = await query.get();
      const categories: Category[] = [];

      snapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Get category by ID
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      const categoryDoc = await adminDb.collection('categories').doc(categoryId).get();
      
      if (!categoryDoc.exists) {
        return null;
      }

      return { id: categoryDoc.id, ...categoryDoc.data() } as Category;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  // Get categories with product counts
  static async getCategoriesWithCounts(storeId?: string): Promise<Category[]> {
    const categories = await this.getCategories(storeId, false);
    
    if (!adminDb) {
      return categories;
    }

    try {
      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          let productQuery = adminDb.collection('products').where('category', '==', category.id);
          
          if (storeId) {
            productQuery = productQuery.where('storeId', '==', storeId) as any;
          }
          
          const productSnapshot = await productQuery.get();
          
          return {
            ...category,
            productCount: productSnapshot.size
          };
        })
      );

      return categoriesWithCounts;
    } catch (error) {
      console.error('Error fetching category counts:', error);
      // Return categories without counts if error
      return categories;
    }
  }

  // Get subcategories for a parent category
  static async getSubcategories(parentCategoryId: string, storeId?: string): Promise<Category[]> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      let query = adminDb
        .collection('categories')
        .where('parentCategoryId', '==', parentCategoryId)
        .where('isActive', '==', true);

      if (storeId) {
        query = query.where('storeId', 'in', [storeId, null]) as any;
      }

      query = query.orderBy('displayOrder') as any;

      const snapshot = await query.get();
      const subcategories: Category[] = [];

      snapshot.forEach(doc => {
        subcategories.push({ id: doc.id, ...doc.data() } as Category);
      });

      return subcategories;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw new Error('Failed to fetch subcategories');
    }
  }

  // Create new category
  static async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      // Get next display order
      let query = adminDb.collection('categories');
      if (categoryData.storeId) {
        query = query.where('storeId', '==', categoryData.storeId) as any;
      } else {
        query = query.where('storeId', '==', null) as any;
      }

      const maxOrderSnapshot = await query.orderBy('displayOrder', 'desc').limit(1).get();
      const nextOrder = maxOrderSnapshot.empty ? 1 : maxOrderSnapshot.docs[0].data().displayOrder + 1;

      const newCategoryData = {
        ...categoryData,
        displayOrder: categoryData.displayOrder || nextOrder,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await adminDb.collection('categories').add(newCategoryData);
      return { id: docRef.id, ...newCategoryData };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  // Update category
  static async updateCategory(categoryId: string, updateData: Partial<Category>): Promise<Category> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      const categoryRef = adminDb.collection('categories').doc(categoryId);
      const categoryDoc = await categoryRef.get();

      if (!categoryDoc.exists) {
        throw new Error('Category not found');
      }

      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await categoryRef.update(updatedData);

      const updatedDoc = await categoryRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  // Delete category (with validation)
  static async deleteCategory(categoryId: string): Promise<void> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      // Check if category has products
      const productsSnapshot = await adminDb
        .collection('products')
        .where('category', '==', categoryId)
        .limit(1)
        .get();

      if (!productsSnapshot.empty) {
        throw new Error('Cannot delete category with existing products');
      }

      // Check if category has subcategories
      const subcategoriesSnapshot = await adminDb
        .collection('categories')
        .where('parentCategoryId', '==', categoryId)
        .limit(1)
        .get();

      if (!subcategoriesSnapshot.empty) {
        throw new Error('Cannot delete category with subcategories');
      }

      await adminDb.collection('categories').doc(categoryId).delete();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // Reorder categories
  static async reorderCategories(categoryIds: string[]): Promise<void> {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    try {
      const batch = adminDb.batch();

      categoryIds.forEach((categoryId, index) => {
        const categoryRef = adminDb.collection('categories').doc(categoryId);
        batch.update(categoryRef, {
          displayOrder: index + 1,
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw new Error('Failed to reorder categories');
    }
  }
}
