import React, { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Plus, Trash2, Upload, X, Edit } from "lucide-react";
import { Product } from "@/types";

// Categorías disponibles
const CATEGORIES = [
    "Proteínas", "Rendimiento", "Pre-entreno", "Aminoácidos", "Ganadores", "Vitaminas"
];

const AdminProduct: React.FC = () => {
    const { addProduct, products, deleteProduct, updateProduct } = useProducts();
    const navigate = useNavigate();

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: CATEGORIES[0],
        image: "",
        isNew: false,
        isSale: false,
        salePrice: "",
    });

    const [imagePreview, setImagePreview] = useState<string>("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    
    // Estado para el modal de edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        isNew: false,
        isSale: false,
        salePrice: "",
    });
    const [editImagePreview, setEditImagePreview] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setEditFormData({ ...editFormData, [name]: checked });
        } else {
            setEditFormData({ ...editFormData, [name]: value });
        }
    };

    // Manejar la carga de imagen desde el computador
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Error",
                description: "Por favor selecciona un archivo de imagen válido",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "La imagen no debe superar los 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingImage(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData({ ...formData, image: base64String });
            setImagePreview(base64String);
            setIsUploadingImage(false);
            toast({
                title: "¡Imagen cargada!",
                description: "La imagen se ha cargado correctamente",
            });
        };

        reader.onerror = () => {
            setIsUploadingImage(false);
            toast({
                title: "Error",
                description: "No se pudo cargar la imagen",
                variant: "destructive",
            });
        };

        reader.readAsDataURL(file);
    };

    // Manejar la carga de imagen en el modal de edición
    const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: "Error",
                description: "Por favor selecciona un archivo de imagen válido",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "La imagen no debe superar los 5MB",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setEditFormData({ ...editFormData, image: base64String });
            setEditImagePreview(base64String);
            toast({
                title: "¡Imagen cargada!",
                description: "La imagen se ha cargado correctamente",
            });
        };

        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: "" });
        setImagePreview("");
    };

    const handleRemoveEditImage = () => {
        setEditFormData({ ...editFormData, image: "" });
        setEditImagePreview("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.image) {
            toast({ 
                title: "Error", 
                description: "Todos los campos son obligatorios, incluyendo la imagen", 
                variant: "destructive" 
            });
            return;
        }

        const priceNumber = parseFloat(formData.price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            toast({ 
                title: "Error", 
                description: "El precio debe ser un número mayor a 0", 
                variant: "destructive" 
            });
            return;
        }

        // Validar precio de oferta si está en oferta
        let salePriceNumber: number | undefined = undefined;
        let originalPriceNumber: number | undefined = undefined;
        
        if (formData.isSale) {
            if (!formData.salePrice) {
                toast({ 
                    title: "Error", 
                    description: "Debes ingresar el precio de oferta", 
                    variant: "destructive" 
                });
                return;
            }
            salePriceNumber = parseFloat(formData.salePrice);
            if (isNaN(salePriceNumber) || salePriceNumber <= 0) {
                toast({ 
                    title: "Error", 
                    description: "El precio de oferta debe ser mayor a 0", 
                    variant: "destructive" 
                });
                return;
            }
            if (salePriceNumber >= priceNumber) {
                toast({ 
                    title: "Error", 
                    description: "El precio de oferta debe ser menor al precio original", 
                    variant: "destructive" 
                });
                return;
            }
            originalPriceNumber = priceNumber;
        }

        addProduct({
            name: formData.name,
            description: formData.description,
            price: formData.isSale ? salePriceNumber! : priceNumber,
            category: formData.category,
            image: formData.image,
            isNew: formData.isNew,
            isSale: formData.isSale,
            originalPrice: originalPriceNumber,
        });

        toast({ 
            title: "¡Éxito!", 
            description: "Producto agregado correctamente a la tienda." 
        });

        setFormData({ 
            name: "", 
            description: "", 
            price: "", 
            category: CATEGORIES[0], 
            image: "",
            isNew: false,
            isSale: false,
            salePrice: "",
        });
        setImagePreview("");
    };

    // Abrir modal de edición
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setEditFormData({
            name: product.name,
            description: product.description,
            price: product.originalPrice?.toString() || product.price.toString(),
            category: product.category,
            image: product.image,
            isNew: product.isNew || false,
            isSale: product.isSale || false,
            salePrice: product.isSale && product.originalPrice ? product.price.toString() : "",
        });
        setEditImagePreview(product.image);
        setIsEditModalOpen(true);
    };

    // Guardar cambios de edición
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) return;

        if (!editFormData.name || !editFormData.description || !editFormData.image) {
            toast({ 
                title: "Error", 
                description: "Todos los campos son obligatorios", 
                variant: "destructive" 
            });
            return;
        }

        const priceNumber = parseFloat(editFormData.price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            toast({ 
                title: "Error", 
                description: "El precio debe ser un número mayor a 0", 
                variant: "destructive" 
            });
            return;
        }

        let salePriceNumber: number | undefined = undefined;
        let originalPriceNumber: number | undefined = undefined;
        
        if (editFormData.isSale) {
            if (!editFormData.salePrice) {
                toast({ 
                    title: "Error", 
                    description: "Debes ingresar el precio de oferta", 
                    variant: "destructive" 
                });
                return;
            }
            salePriceNumber = parseFloat(editFormData.salePrice);
            if (isNaN(salePriceNumber) || salePriceNumber <= 0) {
                toast({ 
                    title: "Error", 
                    description: "El precio de oferta debe ser mayor a 0", 
                    variant: "destructive" 
                });
                return;
            }
            if (salePriceNumber >= priceNumber) {
                toast({ 
                    title: "Error", 
                    description: "El precio de oferta debe ser menor al precio original", 
                    variant: "destructive" 
                });
                return;
            }
            originalPriceNumber = priceNumber;
        }

        updateProduct(editingProduct.id, {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.isSale ? salePriceNumber! : priceNumber,
            category: editFormData.category,
            image: editFormData.image,
            isNew: editFormData.isNew,
            isSale: editFormData.isSale,
            originalPrice: originalPriceNumber,
        });

        toast({ 
            title: "¡Actualizado!", 
            description: "Producto actualizado correctamente" 
        });

        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    // Calcular descuento
    const calculateDiscount = (originalPrice: string, salePrice: string): number => {
        const op = parseFloat(originalPrice);
        const sp = parseFloat(salePrice);
        if (isNaN(op) || isNaN(sp) || op === 0) return 0;
        return Math.round(((op - sp) / op) * 100);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <button 
                    onClick={() => navigate("/tienda")} 
                    className="flex items-center text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la tienda
                </button>

                <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Formulario de Agregar */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" /> Agregar Nuevo Producto
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nombre del Producto</label>
                                <input
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange}
                                    className="input-field w-full" 
                                    placeholder="Ej. Ultra Whey Pro"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Descripción Corta</label>
                                <textarea
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange}
                                    className="input-field w-full min-h-[80px]" 
                                    placeholder="Breve descripción..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Precio ($)</label>
                                    <input
                                        type="number" 
                                        step="0.01" 
                                        name="price" 
                                        value={formData.price} 
                                        onChange={handleChange}
                                        className="input-field w-full" 
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Precio regular del producto
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Categoría</label>
                                    <select
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange}
                                        className="input-field w-full"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Opciones de etiquetas */}
                            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                <label className="text-sm font-medium block">Etiquetas del Producto</label>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isNew"
                                        name="isNew"
                                        checked={formData.isNew}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="isNew" className="text-sm cursor-pointer">
                                        Marcar como <span className="badge-new">Nuevo</span>
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isSale"
                                        name="isSale"
                                        checked={formData.isSale}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="isSale" className="text-sm cursor-pointer">
                                        Marcar como <span className="badge-sale">Oferta</span>
                                    </label>
                                </div>

                                {formData.isSale && (
                                    <div className="mt-3">
                                        <label className="text-sm font-medium mb-1 block">Precio de Oferta ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="salePrice"
                                            value={formData.salePrice}
                                            onChange={handleChange}
                                            className="input-field w-full"
                                            placeholder="0.00"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Precio con descuento (debe ser menor al precio regular)
                                        </p>
                                        {formData.price && formData.salePrice && (
                                            <p className="text-xs text-primary mt-1 font-semibold">
                                                Descuento: {calculateDiscount(formData.price, formData.salePrice)}%
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sección de carga de imagen */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Imagen del Producto</label>
                                
                                {!imagePreview ? (
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isUploadingImage}
                                        />
                                        <label 
                                            htmlFor="image-upload" 
                                            className="cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {isUploadingImage ? "Cargando..." : "Subir imagen"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG, WEBP hasta 5MB
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative border border-border rounded-lg p-4">
                                        <img 
                                            src={imagePreview} 
                                            alt="Vista previa" 
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-6 right-6 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                className="btn-primary w-full"
                                disabled={isUploadingImage}
                            >
                                {isUploadingImage ? "Cargando imagen..." : "Publicar Producto"}
                            </button>
                        </form>
                    </div>

                    {/* Lista de productos */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-6">Inventario Actual ({products.length})</h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {products.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-12 h-12 rounded object-cover bg-gray-100" 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "/placeholder.svg";
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{product.name}</p>
                                                {product.isNew && <span className="badge-new text-[10px] px-1.5 py-0.5">Nuevo</span>}
                                                {product.isSale && <span className="badge-sale text-[10px] px-1.5 py-0.5">Oferta</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs font-semibold text-foreground">${product.price}</p>
                                                {product.originalPrice && (
                                                    <>
                                                        <p className="text-xs text-muted-foreground line-through">${product.originalPrice}</p>
                                                        <p className="text-xs text-primary font-medium">
                                                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                                            title="Editar producto"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Eliminar este producto?')) deleteProduct(product.id);
                                            }}
                                            className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                                            title="Eliminar producto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de Edición */}
            {isEditModalOpen && editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Edit className="w-5 h-5 text-primary" /> Editar Producto
                            </h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nombre del Producto</label>
                                <input
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditChange}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Descripción</label>
                                <textarea
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    className="input-field w-full min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Precio ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={editFormData.price}
                                        onChange={handleEditChange}
                                        className="input-field w-full"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Precio regular del producto
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Categoría</label>
                                    <select
                                        name="category"
                                        value={editFormData.category}
                                        onChange={handleEditChange}
                                        className="input-field w-full"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Opciones de etiquetas en modal */}
                            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                <label className="text-sm font-medium block">Etiquetas del Producto</label>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit-isNew"
                                        name="isNew"
                                        checked={editFormData.isNew}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="edit-isNew" className="text-sm cursor-pointer">
                                        Marcar como <span className="badge-new">Nuevo</span>
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit-isSale"
                                        name="isSale"
                                        checked={editFormData.isSale}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="edit-isSale" className="text-sm cursor-pointer">
                                        Marcar como <span className="badge-sale">Oferta</span>
                                    </label>
                                </div>

                                {editFormData.isSale && (
                                    <div className="mt-3">
                                        <label className="text-sm font-medium mb-1 block">Precio de Oferta ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="salePrice"
                                            value={editFormData.salePrice}
                                            onChange={handleEditChange}
                                            className="input-field w-full"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Precio con descuento (debe ser menor al precio regular)
                                        </p>
                                        {editFormData.price && editFormData.salePrice && (
                                            <p className="text-xs text-primary mt-1 font-semibold">
                                                Descuento: {calculateDiscount(editFormData.price, editFormData.salePrice)}%
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Imagen en modal */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Imagen del Producto</label>
                                
                                {editImagePreview ? (
                                    <div className="relative border border-border rounded-lg p-4">
                                        <img 
                                            src={editImagePreview} 
                                            alt="Vista previa" 
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveEditImage}
                                            className="absolute top-6 right-6 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="mt-2">
                                            <input
                                                type="file"
                                                id="edit-image-upload"
                                                accept="image/*"
                                                onChange={handleEditImageUpload}
                                                className="hidden"
                                            />
                                            <label 
                                                htmlFor="edit-image-upload" 
                                                className="text-xs text-primary cursor-pointer hover:underline"
                                            >
                                                Cambiar imagen
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                                        <input
                                            type="file"
                                            id="edit-image-upload"
                                            accept="image/*"
                                            onChange={handleEditImageUpload}
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor="edit-image-upload" 
                                            className="cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-primary" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">Subir imagen</p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AdminProduct;
