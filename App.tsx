// File: App.tsx (Sửa logic map data)
import React, { useState, useCallback, useEffect } from 'react';
import api from './lib/axios'; // Đảm bảo import từ file mới
import { CartProvider } from './contexts/CartContext';
import { Product, Theme, User, Order, OrderStatus, CartItem, UserResponse , CreateProductRequest} from './types';
import Header from './components/Header';
import Footer from './components/Footer'; 
import HomePage from './components/HomePage';
import ProductPage from './components/ProductPage';
import CategoryPage from './components/CategoryPage';
import CheckoutPage from './components/CheckoutPage';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import { navLinks, allProducts as initialProducts } from './constants';
import BrandsPage from './components/BrandsPage';
import { brands } from './constants';
import AdminPage from './components/AdminPage';
import AccountPage from './components/AccountPage';
import OrderHistoryPage from './components/OrderHistoryPage';


// === BƯỚC 1: THÊM HÀM PARSE NÀY (BÊN NGOÀI COMPONENT APP) ===
/**
 * Tự động bóc tách flavor/size từ variant.name.
 * Không cần database, chỉ đọc text.
 * Ví dụ: "Vị Chocolate 1kg" -> { flavor: "Chocolate", size: "1kg" }
 * Ví dụ: "Icy Blue Razz 60 Servings" -> { flavor: "Icy Blue Razz", size: "60 Servings" }
 */
const parseVariantName = (name: string): { flavor: string, size: string } => {
    // Tìm size (ví dụ: 5Lbs, 1kg, 60 Servings, 30 servings)
    // Regex này tìm số, có thể có dấu chấm, theo sau là "Lbs", "kg", hoặc "Servings"
    const sizeRegex = /(\d+(\.\d+)?\s*(Lbs|kg|Servings))/i;
    const sizeMatch = name.match(sizeRegex);
    
    let size = "Standard"; // Mặc định nếu không tìm thấy
    let flavor = name; // Mặc định là cả tên

    if (sizeMatch && sizeMatch[0]) {
        size = sizeMatch[0].replace(/\s+/g, ''); // Lấy size, ví dụ: "1kg" hoặc "60Servings"
        
        // Flavor là phần tên còn lại, bỏ chữ "Vị" (nếu có)
        flavor = name.replace(sizeRegex, '') // Bỏ phần size
                     .replace(/^Vị\s+/i, '') // Bỏ chữ "Vị " ở đầu
                     .trim(); // Làm sạch
    } else {
         // Nếu không có size, thì chỉ cần bỏ chữ "Vị"
         flavor = name.replace(/^Vị\s+/i, '').trim();
    }

    // Đảm bảo không rỗng
    return { 
        flavor: flavor || 'Default Flavor', 
        size: size 
    };
};


// === BƯỚC 2: SỬA HÀM MAP NÀY ===
const mapProductResponseToProduct = (res: any): Product => {
  // 1. Map qua các variants VÀ thêm 'flavor', 'size' đã phân tích
  const mappedVariants = (res.variants || []).map((v: any) => {
      // Dùng hàm parse mới
      const { flavor: parsedFlavor, size: parsedSize } = parseVariantName(v.name);
      
      // Ghi đè/Thêm 2 trường 'flavor' và 'size' vào mỗi variant
      return {
          ...v,
          flavor: parsedFlavor, 
          size: parsedSize,     
      };
  });

  // 2. Tạo allFlavors và allSizes TỪ 'mappedVariants' MỚI (đã có data)
  const allFlavors: string[] = mappedVariants.length > 0
    ? [...new Set<string>(mappedVariants.map((v: any) => v.flavor as string).filter(Boolean))]
    : [];

  const allSizes: string[] = mappedVariants.length > 0
    ? [...new Set<string>(mappedVariants.map((v: any) => v.size as string).filter(Boolean))]
    : [];
  
  // 3. Lấy firstVariant từ list MỚI
  const firstVariant = mappedVariants.length > 0 ? mappedVariants[0] : null;
  const categoryId = res.category?.categoryId || 0;
  const brandId = res.brand?.brandId || 0;

  return {
    id: res.productId,
    name: res.name,
    description: res.description,
    category: res.categoryName,
    brand: res.brandName,
    
    // DÙNG LIST MỚI (ĐÃ CÓ FLAVOR/SIZE)
    variants: mappedVariants, 
    
    price: firstVariant?.price || 0,
    oldPrice: firstVariant?.oldPrice || undefined,
    sku: firstVariant?.sku || 'N/A',
    inStock: (firstVariant?.stockQuantity || 0) > 0,
    stockQuantity: firstVariant?.stockQuantity || 0,
    images: [`https://picsum.photos/seed/product${res.productId}/400/400`],
    rating: 0,
    reviews: 0,
    sold: 0,
    
    // DÙNG LIST MỚI
    flavors: allFlavors, 
    sizes: allSizes,     

    categoryId: categoryId,
    brandId: brandId,
  };
};


// --- Mock Data (Giữ nguyên code mock của bạn) ---
const product1 = initialProducts.find(p => p.id === 1)!;
const product1_variant = product1.variants.find(v => v.flavor === 'Double Rich Chocolate' && v.size === '5Lbs')!;
const product7 = initialProducts.find(p => p.id === 7)!;
const product7_variant = product7.variants.find(v => v.flavor === 'Icy Blue Razz')!;
const product5 = initialProducts.find(p => p.id === 5)!;
const product5_variant = product5.variants.find(v => v.flavor === 'Chocolate')!;
const initialOrders: Order[] = [
  {
    id: 'GS12345',
    date: '15/07/2023',
    status: 'Đã giao hàng',
    total: 1850000,
    items: [
      {
        productId: product1.id,
        variantId: product1_variant.variantId,
        name: `${product1.name} - ${product1_variant.name}`,
        image: product1.images[0],
        price: product1_variant.price,
        quantity: 1,
        sku: product1_variant.sku,
        size: '5Lbs', 
        flavor: 'Double Rich Chocolate'
      },
    ],
    customer: { name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901234567', address: '123 Đường A, Quận B, TP. HCM' },
    paymentStatus: 'Đã thanh toán',
    paymentMethod: 'card',
  },
  {
    id: 'GS12340',
    date: '10/07/2023',
    status: 'Đang xử lý',
    total: 2700000,
    items: [
      {
        productId: product7.id,
        variantId: product7_variant.variantId,
        name: `${product7.name} - ${product7_variant.name}`,
        image: product7.images[0],
        price: product7_variant.price,
        quantity: 1,
        sku: product7_variant.sku,
        size: product7_variant.size,
        flavor: product7_variant.flavor
      },
      {
        productId: product5.id,
        variantId: product5_variant.variantId,
        name: `${product5.name} - ${product5_variant.name}`,
        image: product5.images[0],
        price: product5_variant.price,
        quantity: 1,
        sku: product5_variant.sku,
        size: product5_variant.size,
        flavor: product5_variant.flavor
      },
    ],
    customer: { name: 'Trần Thị Bích', email: 'bich.tran@example.com', phone: '0912345678', address: '456 Đường C, Quận D, Hà Nội' },
    paymentStatus: 'Chưa thanh toán',
    paymentMethod: 'cod',
  },
];


type Page = 'home' | 'product' | 'category' | 'checkout' | 'brands' | 'account' | 'order-history';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  // SỬA LỖI 1: Khởi tạo mảng rỗng
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders); 
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

  
  // SỬA LỖI 2: Hàm fetchProducts phải gọi setProducts
  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      console.log("Đã tải lại products:", res.data);
      
      // DÙNG HÀM MAP ĐÃ SỬA
      const mappedProducts = res.data.map(mapProductResponseToProduct);
      setProducts(mappedProducts); // Bỏ comment dòng này

    } catch (err: any) {
      console.error("Lỗi tải lại products:", err);
    }
  }, []); 


  // SỬA LỖI 3: useEffect khởi động phải gọi fetchProducts
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
      } catch (e) {
        console.error("Lỗi parse user JSON:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // GỌI HÀM NÀY KHI APP MỞ LÊN
    fetchProducts(); 
    
  }, [fetchProducts]); // Thêm fetchProducts vào dependency array


  // Xử lý đăng nhập
  const handleLoginSuccess = useCallback((userResponse: UserResponse) => { 
    localStorage.setItem('user', JSON.stringify(userResponse));
    const userRole = userResponse.role as ('USER' | 'ADMIN');
    setCurrentUser({
      name: `${userResponse.firstName} ${userResponse.lastName}`,
      role: userRole
    });
    setIsAuthModalOpen(false);
    if (userRole === 'ADMIN') { 
      setIsAdminViewingSite(false);
    }
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setCurrentUser(null);
    setPage('home');
    setIsAdminViewingSite(false);
  }, []);

  
  // Logic gọi API (Đã đúng)
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
  
  // --- (CÁC HÀM HANDLE... CŨ GIỮ NGUYÊN) ---
  
  const handlePlaceOrder = useCallback((orderDetails: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...orderDetails,
      id: `GS${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toLocaleString('vi-VN'),
      status: 'Đang xử lý',
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    alert('Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.');
    setPage('home'); 
  }, []);

  const handleUpdateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
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

  const renderPage = () => {
    switch (page) {
      case 'product':
        return <ProductPage product={selectedProduct!} onBack={handleGoHome} />;
      case 'category':
        const filterBy = selectedBrand 
          ? { type: 'brand' as const, value: selectedBrand }
          : { type: 'category' as const, value: selectedCategory! };
        return <CategoryPage products={products} filterBy={filterBy} onProductSelect={handleProductSelect} onBack={handleGoHome} />;
      case 'checkout':
        return <CheckoutPage onBackToShop={handleGoHome} onPlaceOrder={handlePlaceOrder} />;
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

  // Logic kiểm tra Admin chuẩn
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
