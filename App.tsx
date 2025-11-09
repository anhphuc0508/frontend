// File: src/App.tsx (Đã SỬA LỖI Typo </main> main> và logic OrderStatus)

import React, { useState, useCallback, useEffect } from 'react';
import api from './lib/axios';
import { CartProvider } from './contexts/CartContext';

import { 
    Product, 
    Theme, 
    User, 
    Order, 
    OrderStatus, // <-- ĐÃ SỬA (import type mới)
    CartItem, 
    UserResponse , 
    CreateProductRequest,
    ProductVariant, 
    PaymentStatus,
    // Cần thêm productName vào CartItem của types.ts để code này chạy
    // product: Product
} from './types';

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
import OrderHistoryPage from './components/OrderHistoryPage'; // <-- Sẽ dùng component mới

// [ƯU TIÊN FILE 2] Sử dụng logic map mới nhất từ App.tsx
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

// [ƯU TIÊN FILE 2] Sử dụng logic map mới nhất từ App.tsx
// File: src/App.tsx

// [ƯU TIÊN FILE 2] Sử dụng logic map mới nhất từ App.tsx
const mapProductResponseToProduct = (res: any): Product => {
  const mappedVariants = (res.variants || []).map((v: any) => {
      const { flavor: parsedFlavor, size: parsedSize } = parseVariantName(v.name);
      return { ...v, flavor: parsedFlavor, size: parsedSize };
  });
  const allFlavors: string[] = [...new Set<string>(mappedVariants.map((v: any) => v.flavor as string).filter(Boolean))];
  const allSizes: string[] = [...new Set<string>(mappedVariants.map((v: any) => v.size as string).filter(Boolean))];
  const firstVariant = mappedVariants.length > 0 ? mappedVariants[0] : null;

  // ===================================
  // === SỬA LỖI Ở ĐÂY ===
  // Đọc ID trực tiếp từ "res", không đọc từ "res.category"
  // ===================================
  const categoryId = res.categoryId || 0;
  const brandId = res.brandId || 0;
  // ===================================

  return {
    id: res.productId,
    name: res.name,
    description: res.description,
    category: res.categoryName, // Dòng này của bạn đã đúng (đọc phẳng)
    brand: res.brandName,       // Dòng này của bạn đã đúng (đọc phẳng)
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
    categoryId: categoryId, // <--- Giờ sẽ là ID đúng
    brandId: brandId,     // <--- Giờ sẽ là ID đúng
  };
};

// *** ĐÃ SỬA LỖI MAPPING ĐƠN HÀNG ĐỂ CÓ THÊM size, flavor, và productName ***
const mapBackendOrderToFrontendOrder = (beOrder: any): Order => {
  
  // === SỬA LỖI: Xóa hàm mapStatus cũ ===
  // const mapStatus = (status: string): OrderStatus => { ... }
  // === KẾT THÚC XÓA ===

  const mapPaymentStatus = (status: string): PaymentStatus => {
    if (status === 'PAID') return 'Đã thanh toán';
    return 'Chưa thanh toán'; // PENDING hoặc mặc định
  };
  
  const mapItems = (details: any[]): CartItem[] => {
    return details.map(d => {
      // Dùng hàm parseVariantName đã có sẵn để trích xuất size/flavor từ variantName
      const { flavor: parsedFlavor, size: parsedSize } = parseVariantName(d.variantName || d.productName || 'Default Variant');
      
      return {
        variantId: d.variantId,
        productId: d.productId || 0, // Thêm productId nếu có
        productName: d.productName || 'N/A', // <-- ĐÃ THÊM: Tên sản phẩm chính (Nguồn lỗi đã được sửa)
        name: d.variantName || d.productName, // Tên biến thể
        image: `https://picsum.photos/seed/product${d.variantId || d.productId}/400/400`, 
        price: d.priceAtPurchase,
        quantity: d.quantity,
        sku: d.sku || 'N/A', 
        size: parsedSize,     // <-- ĐÃ THÊM
        flavor: parsedFlavor  // <-- ĐÃ THÊM
      };
    });
  };

  return {
    id: String(beOrder.orderId), 
    date: new Date(beOrder.createdAt).toLocaleString('vi-VN'),
    
    // === SỬA LỖI: Lưu trạng thái GỐC từ backend ===
    status: beOrder.status as OrderStatus, // <-- SỬA Ở ĐÂY
    // =============================================

    total: beOrder.totalAmount,
    items: mapItems(beOrder.orderDetails || []),
    customer: {
      name: beOrder.shippingFullName,
      email: beOrder.shippingEmail || '', 
      phone: beOrder.shippingPhone || '', 
      address: beOrder.shippingAddress,
    },
    paymentStatus: mapPaymentStatus(beOrder.paymentStatus),
    paymentMethod: String(beOrder.paymentMethod).toLowerCase() as ('cod' | 'card'),
  };
};
// *** KẾT THÚC PHẦN SỬA LỖI MAPPING ĐƠN HÀNG ***


type Page = 'home' | 'product' | 'category' | 'checkout' | 'brands' | 'account' | 'order-history';

// === SỬA LỖI: Xóa hàm mapVietnameseStatusToBackend ===
// const mapVietnameseStatusToBackend = (vnStatus: OrderStatus): string => { ... }
// === KẾT THÚC XÓA ===


const App: React.FC = () => {
  // [ƯU TIÊN FILE 2] State
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

  // [ƯU TIÊN FILE 2] useEffect Theme
  useEffect(() => {
    const body = document.body;
    body.className = 'bg-gym-darker text-white'; 
    if (currentUser?.role === 'ADMIN' && !isAdminViewingSite) {
        body.classList.add(`admin-theme-${theme}`);
    } else {
        body.classList.add(`theme-${theme}`);
    }
  }, [theme, currentUser, isAdminViewingSite]);

  
  // [ƯU TIÊN FILE 2] fetchProducts
  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      console.log("Đã tải lại products:", res.data);
      const mappedProducts = res.data.map(mapProductResponseToProduct);
      setProducts(mappedProducts); 
    } catch (err: any) {
      console.error("Lỗi tải lại products:", err);
    }
  }, []); 

  // [ƯU TIÊN FILE 2] fetchOrders (nhận tham số)
  const fetchOrders = useCallback(async (userRole: 'ADMIN' | 'USER') => {
    try {
      const endpoint = userRole === 'ADMIN' ? '/orders' : '/orders/my-orders';
      const res = await api.get(endpoint);
      
      const mappedOrders = res.data.map(mapBackendOrderToFrontendOrder);
      setOrders(mappedOrders);

    } catch (err: any) {
      console.error("Lỗi tải đơn hàng:", err);
      setOrders([]); 
    }
  }, []);

  // [ƯU TIÊN FILE 2] useEffect chính (tải orders ngay khi có user)
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


  // [ƯU TIÊN FILE 2] handleLoginSuccess (tải orders ngay khi login)
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

  // [ƯU TIÊN FILE 2] handleLogout (xóa orders state)
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setCurrentUser(null);
    setOrders([]); 
    setPage('home');
    setIsAdminViewingSite(false);
  }, []);

  
  // [ƯU TIÊN FILE 2] Các hàm CRUD product
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
  
  // [ƯU TIÊN FILE 2] handleOrderSuccess (callback sau khi checkout thành công)
  const handleOrderSuccess = useCallback(() => {
    fetchProducts(); 
    if (currentUser) {
      fetchOrders(currentUser.role); 
    }
    setPage('home'); 
    window.scrollTo(0, 0);
  }, [fetchProducts, fetchOrders, currentUser]); 


  // *** SỬA LỖI LOGIC: Hàm này giờ nhận TRẠNG THÁI GỐC (cho Admin)
  // *** hoặc một string đặc biệt 'CANCEL_USER' (cho User)
  const handleUpdateOrderStatus = useCallback(async (
      orderId: string, 
      action: OrderStatus | 'CANCEL_USER' // Nhận 1 trong 2
    ) => {
      
    if (!currentUser) {
        alert('Vui lòng đăng nhập lại để thực hiện.');
        return;
    }

    try {
        const orderIdNum = parseInt(orderId.replace(/[^0-9]/g, ''));
        
        if (currentUser.role === 'ADMIN' && action !== 'CANCEL_USER') {
            // Admin đang cập nhật trạng thái (gửi trạng thái gốc)
             await api.put(`/orders/admin/${orderIdNum}/status`, { 
                newStatus: action // Gửi thẳng trạng thái gốc
            });
        
        } else if (currentUser.role === 'USER' && action === 'CANCEL_USER') {
            // User đang nhấn nút "Hủy đơn"
            await api.put(`/orders/${orderIdNum}/cancel`);
        } else {
            alert('Không có quyền thay đổi trạng thái này.');
            return;
        }

        await fetchOrders(currentUser.role);
        alert(`Cập nhật đơn hàng ${orderId} thành công!`); 

    } catch (err: any) {
        console.error("Lỗi Cập nhật trạng thái đơn hàng:", err);
        alert("LỖI: " + (err as any).response?.data?.message || (err as any).message);
    }
  }, [currentUser, fetchOrders]);
  // *** KẾT THÚC SỬA ***

  // [ƯU TIÊN FILE 2] Các hàm điều hướng
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

  // [ƯU TIÊN FILE 2] Các hàm handler còn lại (đã xóa logic review)
  const handleAuthClick = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const handleStockSubscribe = useCallback((productId: number, email: string) => {
    console.log("Gửi đăng ký nhận hàng:", { productId, email });
  }, []);


  // [ƯU TIÊN FILE 2] renderPage (đã xóa onAddReview và dùng onOrderSuccess)
  const renderPage = () => {
    switch (page) {
      
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
                  currentUser={currentUser}// Dùng onOrderSuccess
                />;

      case 'brands':
        return <BrandsPage brands={brands} onBack={handleGoHome} onBrandSelect={handleBrandSelect} />;
      case 'account':
        return <AccountPage currentUser={currentUser!} onBack={handleGoHome} />;
      
      case 'order-history':
        // === SỬA: Truyền hàm onUpdateOrderStatus vào component ===
        return <OrderHistoryPage 
                  onBack={handleGoHome} 
                  orders={orders} 
                  onUpdateOrderStatus={handleUpdateOrderStatus} // <-- ĐÃ THÊM
                />;
      
      case 'home':
      default:
        return <HomePage products={products} onProductSelect={handleProductSelect} onCategorySelect={handleCategorySelect} />;
    }
  };

  // [ƯU TIÊN FILE 2] Render AdminPage
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
        onUpdateOrderStatus={handleUpdateOrderStatus} // Truyền hàm đã vá lỗi
    />;
  }

  // [ƯU TIÊN FILE 2] Render App
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
        
        {/* ======================= */}
        {/* === SỬA TYPO Ở ĐÂY === */}
        {/* ======================= */}
        <main className="min-h-screen">
          {renderPage()}
        </main>
        {/* ======================= */}
        
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