import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/lib/types';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Category, 'id'>>();

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [storeId]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let url = '/api/categories';
      if (storeId) {
        url += `?storeId=${storeId}&includeInactive=true`;
      } else {
        url += '?includeInactive=true';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch categories',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (formData: Omit<Category, 'id'>) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          storeId: storeId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
        setCategories([...categories, data.category]);
        reset();
        setIsDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create category',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async (formData: Omit<Category, 'id'>) => {
    if (!categoryToEdit) return;

    try {
      const response = await fetch(`/api/categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
        
        const updatedCategories = categories.map(cat => 
          cat.id === categoryToEdit.id ? data.category : cat
        );
        
        setCategories(updatedCategories);
        reset();
        setCategoryToEdit(null);
        setIsDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update category',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
        });
        
        const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
        setCategories(updatedCategories);
        setCategoryToDelete(null);
        setIsDeleteDialogOpen(false);
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete category',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const openNewCategoryDialog = () => {
    reset({
      name: '',
      description: '',
      parentCategoryId: '',
      imageUrl: '',
      isActive: true,
      displayOrder: categories.length + 1,
    });
    setCategoryToEdit(null);
    setIsDialogOpen(true);
  };

  const openEditCategoryDialog = (category: Category) => {
    setCategoryToEdit(category);
    setValue('name', category.name);
    setValue('description', category.description || '');
    setValue('parentCategoryId', category.parentCategoryId || '');
    setValue('imageUrl', category.imageUrl || '');
    setValue('isActive', category.isActive);
    setValue('displayOrder', category.displayOrder);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (formData: Omit<Category, 'id'>) => {
    if (categoryToEdit) {
      handleUpdateCategory(formData);
    } else {
      handleCreateCategory(formData);
    }
  };

  const parentCategoryOptions = categories
    .filter(cat => !cat.parentCategoryId) // Only top-level categories
    .filter(cat => !categoryToEdit || cat.id !== categoryToEdit.id) // Can't be parent of itself
    .map(cat => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage product categories for your store
            </CardDescription>
          </div>
          <Button onClick={openNewCategoryDialog}>
            Add New Category
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading categories...</div>
          ) : (
            <Table>
              <TableCaption>A list of your product categories</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No categories found. Create your first category.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.parentCategoryId && <span className="text-muted-foreground mr-1">↳</span>}
                        {category.name}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {category.description || '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>{category.productCount || 0}</TableCell>
                      <TableCell>{category.displayOrder}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditCategoryDialog(category)}>
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => openDeleteDialog(category)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            <DialogDescription>
              {categoryToEdit 
                ? 'Update the category details below.' 
                : 'Enter details for your new product category.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...register('name', { required: 'Category name is required' })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm col-start-2 col-span-3">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  {...register('description')}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentCategoryId" className="text-right">
                  Parent Category
                </Label>
                <select
                  id="parentCategoryId"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  {...register('parentCategoryId')}
                >
                  <option value="">None (Top-level category)</option>
                  {parentCategoryOptions}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  className="col-span-3"
                  placeholder="https://example.com/image.jpg"
                  {...register('imageUrl')}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="displayOrder" className="text-right">
                  Display Order
                </Label>
                <Input
                  id="displayOrder"
                  type="number"
                  className="col-span-3"
                  {...register('displayOrder', { 
                    valueAsNumber: true,
                    min: { value: 1, message: 'Order must be at least 1' }
                  })}
                />
                {errors.displayOrder && (
                  <p className="text-red-500 text-sm col-start-2 col-span-3">
                    {errors.displayOrder.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch 
                    id="isActive" 
                    {...register('isActive')}
                    defaultChecked={true}
                  />
                  <Label htmlFor="isActive" className="text-sm text-muted-foreground">
                    Category will be visible in storefront
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {categoryToEdit ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
