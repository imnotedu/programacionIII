import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProductById } = useProducts();
    const { addToCart } = useCart();
    const { toast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                const p = await getProductById(id);
                setProduct(p);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id, getProductById]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            toast({
                title: "Producto agregado",
                description: `${product.name} se agregó al carrito.`
            });
        }
    };

    if (loading) return <div className="container mx-auto p-8">Cargando...</div>;
    if (!product) return <div className="container mx-auto p-8">Producto no encontrado</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                    <img
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        className="max-h-[500px] object-contain"
                    />
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        {product.isNew && <span className="badge-new ml-2">Nuevo</span>}
                        {product.isSale && <span className="badge-sale ml-2">Oferta</span>}
                    </div>

                    <div className="space-y-2">
                        {product.isSale && product.originalPrice ? (
                            <>
                                <div className="text-2xl text-gray-500 line-through">
                                    ${product.originalPrice}
                                </div>
                                <div className="text-4xl font-bold text-primary">
                                    ${product.price}
                                </div>
                                <div className="text-sm text-primary font-semibold">
                                    Ahorra ${(product.originalPrice - product.price).toFixed(2)} ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                                </div>
                            </>
                        ) : (
                            <div className="text-4xl font-bold text-primary">
                                ${product.price}
                            </div>
                        )}
                    </div>

                    <div className="prose max-w-none">
                        <h3 className="text-lg font-semibold">Descripción</h3>
                        <p className="text-gray-700">{product.description}</p>
                    </div>

                    <div className="border-t pt-6">
                        <p className="mb-4"><strong>Categoría:</strong> {product.category}</p>

                        <Button
                            className="w-full md:w-auto"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Agregar al Carrito
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
