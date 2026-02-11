import React, { useState } from 'react';
import { useProducts, Product } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AdminProduct = () => {
    const { products, createProduct, updateProduct, deleteProduct, loading } = useProducts();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        price: '',
        description: '',
        category: '',
        imageUrl: '',
        stock: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert types
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };

        if (editingProduct) {
            await updateProduct(editingProduct.id, productData);
        } else {
            await createProduct(productData);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            code: product.code,
            price: product.price.toString(),
            description: product.description,
            category: product.category,
            imageUrl: product.imageUrl || '',
            stock: product.stock.toString()
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            await deleteProduct(id);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            code: '',
            price: '',
            description: '',
            category: '',
            imageUrl: '',
            stock: ''
        });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Productos</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>Nuevo Producto</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="code">Código</Label>
                                <Input id="code" name="code" value={formData.code} onChange={handleInputChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="price">Precio</Label>
                                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="category">Categoría</Label>
                                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="imageUrl">URL Imagen</Label>
                                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
                            </div>
                            <Button type="submit" className="w-full">{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent>
                    {loading ? <p>Cargando...</p> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Imagen</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.code}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Editar</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>Eliminar</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProduct;
