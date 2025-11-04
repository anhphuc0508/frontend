// File: App.tsx (Đã dọn dẹp logic review)
import React, { useState, useCallback, useEffect } from 'react';
import api from './lib/axios';
import { CartProvider } from './contexts/CartContext';
import { Product, Theme, User, Order, OrderStatus, CartItem, UserResponse , CreateProductRequest, PaymentStatus} from './types';
import Header from './components/Header';
import Footer from './components/Footer'; 
import HomePage from './components/HomePage';
import ProductPage from './components/ProductPage';
import CategoryPage from './components/CategoryPage';
import CheckoutPage from './components/CheckoutPage';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import { navLinks } from './constants';
import BrandsPage from './components/BrandsPage';
import { brands } from './constants';
import AdminPage from './components/AdminPage';
import AccountPage from './components/AccountPage';
import OrderHistoryPage from './components/OrderHistoryPage';

// ... (tất cả các hàm map... giữ nguyên) ...
const parseVariantName = (name: string): { flavor: string, size: string } => {
    const sizeRegex = /(\d+(\.\d+)?\s*(Lbs|kg|Servings))/i;
    const sizeMatch = name.match(sizeRegex);
    let size = "Standard";
    let flavor = name;
    if (sizeMatch && sizeMatch[0]) {
        size = sizeMatch[0].replace(/\s+/g, '');
        flavor = name.replace(sizeRegex, '').replace(/^Vị\s+/i, '').trim();
    } else {
         flavor = name.replace(/^Vị\s+/i, '').trim();
    }
    return { 
        flavor: flavor || 'Default Flavor', 
        size: size 
    };
};
const mapProductResponseToProduct = (res: any): Product => {
  const mappedVariants = (res.variants || []).map((v: any) => {
      const { flavor: parsedFlavor, size: parsedSize } = parseVariantName(v.name);
      return { ...v, flavor: parsedFlavor, size: parsedSize };
  });
  const allFlavors: string[] = [...new Set<string>(mappedVariants.map((v: any) => v.flavor as string).filter(Boolean))];
  const allSizes: string[] = [...new Set<string>(mappedVariants.map((v: any) => v.size as string).filter(Boolean))];
  const firstVariant = mappedVariants.length > 0 ? mappedVariants[0] : null;
  const categoryId = res.category?.categoryId || 0;
  const brandId = res.brand?.brandId || 0;
  return {
    id: res.productId,
    name: res.name,
    description: res.description,
    category: res.categoryName,
    brand: res.brandName,
    variants: mappedVariants, 
    price: firstVariant?.price || 0,
    oldPrice: firstVariant?.oldPrice || undefined,
    sku: firstVariant?.sku || 'N/A',
    inStock: (firstVariant?.stockQuantity || 0) > 0,
    stockQuantity: firstVariant?.stockQuantity || 0,
    images: [`https://picsum.photos/seed/product${res.productId}/400/400`],
    rating: res.averageRating || 0,
    reviews: res.totalReviews || 0,
    sold: 0,
    flavors: allFlavors, 
    sizes: allSizes,     
    categoryId: categoryId,
    brandId: brandId,
  };
};
const mapBackendOrderToFrontendOrder = (beOrder: any): Order => {
  
  const mapStatus = (status: string): OrderStatus => {
    if (status === 'PENDING_CONFIRMATION') return 'Đang xử lý';
    if (status === 'DELIVERED') return 'Đã giao hàng';
    if (status === 'CANCELLED') return 'Đã hủy';
    return 'Đang xử lý'; // Mặc định
  };

  const mapPaymentStatus = (status: string): PaymentStatus => {
    if (status === 'PAID') return 'Đã thanh toán';
    return 'Chưa thanh toán'; // PENDING hoặc mặc định
  };
  
  const mapItems = (details: any[]): CartItem[] => {
    return details.map(d => ({
      variantId: d.variantId,
      productId: 0, 
      name: `${d.productName} - ${d.variantName}`,
      image: `https://picsum.photos/seed/product${d.variantId}/400/400`, 
      price: d.priceAtPurchase,
      quantity: d.quantity,
      sku: d.sku || 'N/A', 
    }));
  };

  return {
    id: String(beOrder.orderId), 
    date: new Date(beOrder.createdAt).toLocaleString('vi-VN'),
    status: mapStatus(beOrder.status),
    total: beOrder.totalAmount,
    items: mapItems(beOrder.orderDetails || []),
    customer: {
      name: beOrder.shippingFullName,
      email: '', 
      phone: '', 
      address: beOrder.shippingAddress,
    },
    paymentStatus: mapPaymentStatus(beOrder.paymentStatus),
    paymentMethod: String(beOrder.paymentMethod).toLowerCase() as ('cod' | 'card'),
  };
};


type Page = 'home' | 'product' | 'category' | 'checkout' | 'brands' | 'account' | 'order-history';

const App: React.FC = () => {
  // ... (tất cả state giữ nguyên) ...
  const [page, setPage] = useState<Page>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminViewingSite, setIsAdminViewingSite] = useState(false);

  useEffect(() => {
    // ... (theme useEffect giữ nguyên)
  }, [theme, currentUser, isAdminViewingSite]);

  
  const fetchProducts = useCallback(async () => {
    try {
      // Sửa lỗi lặp API (bỏ /api/v1)
      const res = await api.get('/products');
      console.log("Đã tải lại products:", res.data);
      const mappedProducts = res.data.map(mapProductResponseToProduct);
      setProducts(mappedProducts); 
    } catch (err: any) {
      console.error("Lỗi tải lại products:", err);
    }
  }, []); 

  const fetchOrders = useCallback(async (userRole: 'ADMIN' | 'USER') => {
    try {
      const endpoint = userRole === 'ADMIN' ? '/orders' : '/orders/my-orders';
      // Sửa lỗi lặp API (bỏ /api/v1)
      const res = await api.get(endpoint);
      
      const mappedOrders = res.data.map(mapBackendOrderToFrontendOrder);
      setOrders(mappedOrders);

    } catch (err: any) {
      console.error("Lỗi tải đơn hàng:", err);
      setOrders([]); 
    }
  }, []);

  // ... (useEffect chính giữ nguyên) ...
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user'); 
    
    if (token && userJson) {
      try {
        const user: UserResponse = JSON.parse(userJson); 
        const userRole = user.role as ('USER' | 'ADMIN'); 
        setCurrentUser({
          name: `${user.firstName} ${user.lastName}`,
          role: userRole
        });
        
        fetchOrders(userRole); 

      } catch (e) {
        console.error("Lỗi parse user JSON:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    fetchProducts(); 
    
  }, [fetchProducts, fetchOrders]);


  // ... (handleLoginSuccess, handleLogout giữ nguyên) ...
  const handleLoginSuccess = useCallback((userResponse: UserResponse) => { 
    localStorage.setItem('user', JSON.stringify(userResponse));
    const userRole = userResponse.role as ('USER' | 'ADMIN');
    
    setCurrentUser({
      name: `${userResponse.firstName} ${userResponse.lastName}`, 
      role: userRole
    });
    
    fetchOrders(userRole);

    setIsAuthModalOpen(false);
    if (userRole === 'ADMIN') { 
      setIsAdminViewingSite(false);
    }
  }, [fetchOrders]); 

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setCurrentUser(null);
    setOrders([]); 
    setPage('home');
    setIsAdminViewingSite(false);
  }, []);

  
  // ... (Các hàm CRUD product giữ nguyên) ...
  const handleAddProduct = useCallback(async (request: CreateProductRequest) => {
    try {
      await api.post('/products', request); 
      alert('Thêm sản phẩm thành công!');
      await fetchProducts(); 
    } catch (err: any) {
      console.error("Lỗi Thêm sản phẩm:", err);
      alert("LỖI: " + (err as any).response?.data?.message || (err as any).message);
    }
  }, [fetchProducts]);

  const handleUpdateProduct = useCallback(async (productId: number, request: CreateProductRequest) => {
    try {
      await api.put(`/products/${productId}`, request);
      alert('Cập nhật thành công!');
      await fetchProducts(); 
    } catch (err: any) {
      console.error("Lỗi Cập nhật sản phẩm:", err);
      alert("LỖI: " + (err as any).response?.data?.message || (err as any).message);
    }
  }, [fetchProducts]);

  const handleDeleteProduct = useCallback(async (productId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA sản phẩm này không?")) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error("Lỗi Xóa sản phẩm:", err);
      alert("LỖI: " + (err as any).response?.data?.message || (err as any).message);
    }
  }, []);
  
  // ... (Các hàm handle... còn lại giữ nguyên) ...
  const handleOrderSuccess = useCallback(() => {
    fetchProducts(); 
    if (currentUser) {
      fetchOrders(currentUser.role); 
    }
    setPage('home'); 
    window.scrollTo(0, 0);
  }, [fetchProducts, fetchOrders, currentUser]); 


  const handleUpdateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    // TODO: Gọi API PUT /api/v1/orders/{id}/status 
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []); 

  const handleAdminViewSite = useCallback(() => {
    setIsAdminViewingSite(true);
    setPage('home');
    window.scrollTo(0, 0);
  }, []);

  const handleAdminReturnToPanel = useCallback(() => {
    setIsAdminViewingSite(false);
    window.scrollTo(0, 0);
  }, []);

  const handleGoHome = useCallback(() => {
    setPage('home');
    setSelectedProduct(null);
    setSelectedCategory(null);
    setSelectedBrand(null);
    window.scrollTo(0, 0);
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    setPage('product');
    window.scrollTo(0, 0);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    if (category === 'Thương hiệu') {
        setPage('brands');
    } else {
        setSelectedCategory(category);
        setSelectedBrand(null);
        setPage('category');
    }
    window.scrollTo(0, 0);
  }, []);
  
  const handleBrandSelect = useCallback((brandName: string) => {
    setSelectedBrand(brandName);
    setSelectedCategory(null);
    setPage('category');
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    if (currentUser) {
      setPage('checkout');
      window.scrollTo(0, 0);
    } else {
      setIsAuthModalOpen(true);
    }
  }, [currentUser]);
  
  const handleAccountClick = useCallback(() => {
    if (currentUser) {
      setPage('account');
      window.scrollTo(0, 0);
    } else {
      setIsAuthModalOpen(true);
    }
  }, [currentUser]);

  const handleOrderHistoryClick = useCallback(() => {
    if (currentUser) {
      setPage('order-history');
      window.scrollTo(0, 0);
    } else {
      setIsAuthModalOpen(true);
    }
  }, [currentUser]);

  // <<< SỬA LỖI 1: XÓA 'handleAddReview' KHỎI APP.TSX >>>
  // (Đã xóa hàm 'handleAddReview' ở đây)
  
  // Các hàm còn lại
  const handleAuthClick = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleStockSubscribe = useCallback((productId: number, email: string) => {
    console.log("Gửi đăng ký nhận hàng:", { productId, email });
  }, []);


  const renderPage = () => {
    switch (page) {
      
      // <<< SỬA LỖI 2: XÓA PROP 'onAddReview' >>>
      case 'product':
        return <ProductPage 
                  product={selectedProduct!} 
                  onBack={handleGoHome} 
                  
                  currentUser={currentUser}
                  // 'onAddReview' đã bị xóa
                  onAuthClick={handleAuthClick}
                  onStockSubscribe={handleStockSubscribe}
                />;
      
      case 'category':
        const filterBy = selectedBrand 
          ? { type: 'brand' as const, value: selectedBrand }
          : { type: 'category' as const, value: selectedCategory! };
        return <CategoryPage products={products} filterBy={filterBy} onProductSelect={handleProductSelect} onBack={handleGoHome} />;
      
      case 'checkout':
        return <CheckoutPage 
                  onBackToShop={handleGoHome} 
                  onOrderSuccess={handleOrderSuccess} 
                />;

      case 'brands':
        return <BrandsPage brands={brands} onBack={handleGoHome} onBrandSelect={handleBrandSelect} />;
      case 'account':
        return <AccountPage currentUser={currentUser!} onBack={handleGoHome} />;
      
      case 'order-history':
        return <OrderHistoryPage onBack={handleGoHome} orders={orders} />;
      
      case 'home':
      default:
        return <HomePage products={products} onProductSelect={handleProductSelect} onCategorySelect={handleCategorySelect} />;
    }
  };

  // ... (Phần render Admin và return() giữ nguyên) ...
  if (currentUser?.role === 'ADMIN' && !isAdminViewingSite) {
    return <AdminPage 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onViewSite={handleAdminViewSite}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
    />;
  }

  return (
    <CartProvider currentUser={currentUser}>
      <div className="bg-gym-darker text-white font-sans selection:bg-gym-yellow selection:text-gym-darker">
        <Header 
            navLinks={navLinks}
            products={products}
            onCartClick={() => setIsCartOpen(true)} 
            onAuthClick={() => setIsAuthModalOpen(true)}
            onCategorySelect={handleCategorySelect}
            onProductSelect={handleProductSelect}
            onLogoClick={handleGoHome}
            theme={theme}
            setTheme={setTheme}
            currentUser={currentUser}
            onLogout={handleLogout}
            onAccountClick={handleAccountClick}
            onOrderHistoryClick={handleOrderHistoryClick}
            isAdminViewingSite={currentUser?.role === 'ADMIN' && isAdminViewingSite}
            onReturnToAdmin={handleAdminReturnToPanel}
        />
        <main className="min-h-screen">
          {renderPage()}
        </main>
        <CartSidebar 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            onCheckout={handleCheckout} 
        />
        <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
        />
        <Footer />
        <Chatbot />
      </div>
    </CartProvider>
  );
};

export default App;