// File: types.ts (Đã cập nhật ProductVariantRequest và CartItem)
// FIX: Removed self-referential import of Product type.

export interface ProductVariant {
  variantId: number;
  name: string;
  sku: string;       // <- SKU CHÚNG TA CẦN
  price: number;
  oldPrice?: number;
  stockQuantity: number;
  flavor: string;  // Ví dụ: "Chocolate Brownie"
  size: string;      // Ví dụ: "5.5Lbs"
}

// 2. SỬA LẠI INTERFACE PRODUCT
export interface Product {
  id: number;
  name: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  price: number; // (Đây có thể là giá GỐC/THẤP NHẤT)
  oldPrice?: number;
  description: string;
  
  // Bạn có thể giữ 2 mảng này để UI (các nút) hoạt động
  flavors?: string[];
  sizes?: string[];
  
  // BẮT BUỘC THÊM DÒNG NÀY
  variants: ProductVariant[];
  category: string;
  brand: string; // Danh sách các biến thể
  sku?: string;
  subCategory?: string;
  sold: number;
  stockQuantity: number;
  categoryId?: number;
  brandId?: number;
  
}
// --- SỬA LỖI LOGIC Ở ĐÂY: Thêm productName, size, flavor vào CartItem ---
export interface CartItem {
  variantId: number; // Hoặc sku: string
  productId: number;
  name: string; // Tên biến thể (vd: Vị Chocolate 5Lbs)
  productName: string; // <-- ĐÃ THÊM: Tên sản phẩm chính (vd: Gold Standard 100% Whey)
  image: string; // Ảnh đại diện
  price: number; // Giá tại lúc mua
  quantity: number;
  sku: string;
  size?: string;
  flavor?: string;
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
}

export interface Article {
  id: number;
  title: string;
  date: string;
  snippet: string;
  image: string;
  category: string;
}

export interface MegaMenuLink {
  label: string;
  href: string;
  category?: string;
}

export interface MegaMenuItem {
  title: string;
  links: MegaMenuLink[];
}

export interface NavLink {
  label: string;
  href: string;
  megaMenu?: MegaMenuItem[];
}

export type SortOptionValue = 'default' | 'popularity' | 'price-asc' | 'price-desc';

export interface SortOption {
  value: SortOptionValue;
  label: string;
}

export type Theme = 'default' | 'light' | 'black';

export interface User {
  name: string;
  role: 'USER' | 'ADMIN';
}

export type OrderStatus = 'Đã giao hàng' | 'Đang xử lý' | 'Đã hủy';
export type PaymentStatus = 'Chưa thanh toán' | 'Đã thanh toán';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: CartItem[]; // Giờ đây 'items' là một mảng CartItem đã sửa
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentStatus: PaymentStatus;
  paymentMethod: 'cod' | 'card';
}
export interface UserResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string; // (Backend trả về string "USER" hoặc "ADMIN")
}

export interface ProductVariantRequest {
  name: string;
  sku: string;
  price: number; // (Frontend dùng number, backend Java dùng BigDecimal)
  salePrice?: number;
  stockQuantity: number;
  flavor: string; // Bắt buộc admin nhập
  size: string;   // Bắt buộc admin nhập
}

// 2. THÊM TYPE NÀY (Khớp với CreateProductRequest.java )
export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: number; // (Backend yêu cầu ID)
  brandId: number;    // (Backend yêu cầu ID)
  variants: ProductVariantRequest[];
}
export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}