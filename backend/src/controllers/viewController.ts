/**
 * Controlador de Vistas
 * 
 * Maneja el renderizado de todas las páginas EJS de la aplicación.
 * Consume la API REST interna para obtener datos y los pasa a las plantillas.
 */

import { Request, Response } from 'express';
import axios from 'axios';

// Base URL para llamadas internas a la API
const API_BASE = `http://localhost:${process.env.PORT || 3000}/api`;

export class ViewController {
  /**
   * Página de inicio
   * GET /
   * Público
   */
  async home(req: Request, res: Response): Promise<void> {
    try {
      const { data: response } = await axios.get(`${API_BASE}/products`);
      const products = response.data.products || [];

      const featuredProducts = products.slice(0, 4);
      const saleProducts = products.filter((p: any) => p.isSale);

      res.render('pages/home', {
        title: 'PowerFit - Suplementos Deportivos',
        featuredProducts,
        saleProducts
      });
    } catch (error) {
      console.error('Error loading home page:', error);
      req.flash('error', 'Error al cargar productos');
      res.render('pages/home', {
        title: 'PowerFit',
        featuredProducts: [],
        saleProducts: []
      });
    }
  }

  /**
   * Página de tienda
   * GET /tienda
   * Público
   * Requisitos: 19.1, 19.2, 19.3, 19.4, 19.5
   */
  async store(req: Request, res: Response): Promise<void> {
    try {
      // Obtener parámetros de filtrado
      const { category, search, minPrice, maxPrice } = req.query;

      // Obtener todos los productos de la API
      let products = [];
      try {
        const { data: response } = await axios.get(`${API_BASE}/products`);
        products = response.data.products || [];
      } catch (apiError) {
        // Si la API falla, usar datos mock para testing
        console.log('API no disponible, usando datos mock');
        products = [
          {
            id: '1',
            name: 'Whey Protein Gold Standard',
            description: 'Proteína de suero de alta calidad',
            price: 45.99,
            category: 'Proteínas',
            image: '/products/whey-protein.jpg',
            stock: 50,
            isSale: false
          },
          {
            id: '2',
            name: 'Creatina Monohidrato',
            description: 'Creatina pura micronizada',
            price: 25.99,
            category: 'Creatina',
            image: '/products/creatine.jpg',
            stock: 30,
            isSale: true,
            salePrice: 19.99
          },
          {
            id: '3',
            name: 'Pre-Entreno Extreme',
            description: 'Energía y enfoque para tus entrenamientos',
            price: 35.99,
            category: 'Pre-Entreno',
            image: '/products/pre-workout.jpg',
            stock: 25,
            isSale: false
          },
          {
            id: '4',
            name: 'BCAA 2:1:1',
            description: 'Aminoácidos de cadena ramificada',
            price: 29.99,
            category: 'Aminoácidos',
            image: '/products/bcaa.jpg',
            stock: 40,
            isSale: false
          },
          {
            id: '5',
            name: 'Multivitamínico Completo',
            description: 'Vitaminas y minerales esenciales',
            price: 22.99,
            category: 'Vitaminas',
            image: '/products/multivitamin.jpg',
            stock: 60,
            isSale: true,
            salePrice: 18.99
          },
          {
            id: '6',
            name: 'Proteína Vegana',
            description: 'Proteína de origen vegetal',
            price: 39.99,
            category: 'Proteínas',
            image: '/products/vegan-protein.jpg',
            stock: 20,
            isSale: false
          }
        ];
      }

      // Aplicar filtros en el servidor

      // Filtro por búsqueda de texto (nombre o descripción)
      if (search && typeof search === 'string' && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        products = products.filter((p: any) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      // Filtro por categoría
      if (category && typeof category === 'string' && category.trim()) {
        products = products.filter((p: any) =>
          p.category.toLowerCase() === category.toLowerCase().trim()
        );
      }

      // Filtro por precio mínimo
      if (minPrice && typeof minPrice === 'string') {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
          products = products.filter((p: any) => p.price >= min);
        }
      }

      // Filtro por precio máximo
      if (maxPrice && typeof maxPrice === 'string') {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
          products = products.filter((p: any) => p.price <= max);
        }
      }

      res.render('pages/store', {
        title: 'Tienda - PowerFit',
        products,
        filters: { category, search, minPrice, maxPrice },
        favorites: req.session.favorites || []
      });
    } catch (error) {
      console.error('Error loading store page:', error);
      req.flash('error', 'Error al cargar la tienda');
      res.render('pages/store', {
        title: 'Tienda - PowerFit',
        products: [],
        filters: {},
        favorites: req.session.favorites || []
      });
    }
  }

  /**
   * Detalle de producto
   * GET /producto/:id
   * Público
   */
  async productDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { data: response } = await axios.get(`${API_BASE}/products/${id}`);
      const product = response.data.product;

      const isFavorite = req.session.favorites?.includes(id) || false;

      res.render('pages/product-detail', {
        title: `${product.name} - PowerFit`,
        product,
        isFavorite
      });
    } catch (error) {
      console.error('Error loading product detail:', error);
      req.flash('error', 'Producto no encontrado');
      res.redirect('/tienda');
    }
  }

  /**
   * Carrito
   * GET /carrito
   * Público
   */
  async cart(req: Request, res: Response): Promise<void> {
    try {
      const cartItems = req.session.cart || [];
      const productIds = cartItems.map(item => item.productId);

      let products: any[] = [];
      if (productIds.length > 0) {
        // Obtener productos uno por uno ya que no existe endpoint batch
        const productPromises = productIds.map(id =>
          axios.get(`${API_BASE}/products/${id}`).catch(() => null)
        );
        const responses = await Promise.all(productPromises);
        products = responses
          .filter(res => res !== null)
          .map(res => res!.data.data.product);
      }

      const items = cartItems.map(cartItem => {
        const product = products.find((p: any) => p.id === cartItem.productId);
        return {
          product,
          quantity: cartItem.quantity,
          subtotal: product ? product.price * cartItem.quantity : 0
        };
      }).filter(item => item.product); // Filtrar items sin producto

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      res.render('pages/cart', {
        title: 'Carrito - PowerFit',
        items,
        total
      });
    } catch (error) {
      console.error('Error loading cart:', error);
      req.flash('error', 'Error al cargar el carrito');
      res.render('pages/cart', {
        title: 'Carrito - PowerFit',
        items: [],
        total: 0
      });
    }
  }

  /**
   * Checkout
   * GET /checkout
   * Requiere autenticación
   */
  async checkout(req: Request, res: Response): Promise<void> {
    const cartItems = req.session.cart || [];
    if (cartItems.length === 0) {
      req.flash('error', 'Tu carrito está vacío');
      return res.redirect('/carrito');
    }

    try {
      const productIds = cartItems.map(item => item.productId);

      // Obtener productos uno por uno
      const productPromises = productIds.map(id =>
        axios.get(`${API_BASE}/products/${id}`).catch(() => null)
      );
      const responses = await Promise.all(productPromises);
      const products = responses
        .filter(res => res !== null)
        .map(res => res!.data.data.product);

      const items = cartItems.map(cartItem => {
        const product = products.find((p: any) => p.id === cartItem.productId);
        return {
          product,
          quantity: cartItem.quantity,
          subtotal: product ? product.price * cartItem.quantity : 0
        };
      }).filter(item => item.product);

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      res.render('pages/checkout', {
        title: 'Checkout - PowerFit',
        items,
        total
      });
    } catch (error) {
      console.error('Error loading checkout:', error);
      req.flash('error', 'Error al procesar el checkout');
      res.redirect('/carrito');
    }
  }

  /**
   * Favoritos
   * GET /favoritos
   * Público
   */
  async favorites(req: Request, res: Response): Promise<void> {
    try {
      const favoriteIds = req.session.favorites || [];

      let products: any[] = [];
      if (favoriteIds.length > 0) {
        // Obtener productos uno por uno
        const productPromises = favoriteIds.map(id =>
          axios.get(`${API_BASE}/products/${id}`).catch(() => null)
        );
        const responses = await Promise.all(productPromises);
        products = responses
          .filter(res => res !== null)
          .map(res => res!.data.data.product);
      }

      res.render('pages/favorites', {
        title: 'Favoritos - PowerFit',
        products
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
      req.flash('error', 'Error al cargar favoritos');
      res.render('pages/favorites', {
        title: 'Favoritos - PowerFit',
        products: []
      });
    }
  }

  /**
   * Login (GET)
   * GET /login
   * Público (redirige si ya está autenticado)
   */
  login(req: Request, res: Response): void {
    res.render('pages/login', {
      title: 'Iniciar Sesión - PowerFit',
      layout: 'layouts/auth'
    });
  }

  /**
   * Register (GET)
   * GET /register
   * Público (redirige si ya está autenticado)
   */
  register(req: Request, res: Response): void {
    res.render('pages/register', {
      title: 'Registrarse - PowerFit',
      layout: 'layouts/auth'
    });
  }

  /**
   * Admin Products
   * GET /admin-products
   * Requiere autenticación + admin
   */
  async adminProducts(req: Request, res: Response): Promise<void> {
    try {
      const { data: response } = await axios.get(`${API_BASE}/products`);
      const products = response.data.products || [];

      res.render('pages/admin-product', {
        title: 'Administrar Productos - PowerFit',
        products
      });
    } catch (error) {
      console.error('Error loading admin products:', error);
      req.flash('error', 'Error al cargar productos');
      res.render('pages/admin-product', {
        title: 'Administrar Productos - PowerFit',
        products: []
      });
    }
  }

  /**
   * Access Denied
   * GET /access-denied
   * Público
   */
  accessDenied(req: Request, res: Response): void {
    res.status(403).render('pages/access-denied', {
      title: 'Acceso Denegado - PowerFit'
    });
  }

  /**
   * Not Found
   * GET /404
   * Público
   */
  notFound(req: Request, res: Response): void {
    res.status(404).render('pages/not-found', {
      title: 'Página No Encontrada - PowerFit'
    });
  }
}
