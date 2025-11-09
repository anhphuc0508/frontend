// File: src/AdminPage.tsx (ĐÃ SỬA LỖI LOGIC OrderStatus ĐỂ KHỚP VỚI APP.TSX)
import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { User, Theme, Product, Order, OrderStatus, CreateProductRequest } from '../types';
import AddProductModal from './AddProductModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// --- TẤT CẢ ICON SVG (GIỮ NGUYÊN) ---
const PaletteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-5.304-5.304L4.098 14.6c-1.464 1.464-1.464 3.84 0 5.304z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.402-2.368-1.07-3.22a4.5 4.5 0 00-6.364-6.364L12 7.5" />
    </svg>
);
const DashboardIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25H15.75A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H15.75A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const ProductIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v4.5A2.25 2.25 0 0119.5 13.875h-15A2.25 2.25 0 012.25 11.625v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.375A2.25 2.25 0 014.5 16.125h15A2.25 2.25 0 0121.75 18.375v.75A2.25 2.25 0 0119.5 21.375h-15A2.25 2.25 0 012.25 19.125v-.75z" />
    </svg>
);
const OrderIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);
const UserIconSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.452a9.75 9.75 0 00-1.594-1.594l-2.072-2.072a3.375 3.375 0 00-4.774-4.774l-2.072-2.072a9.75 9.75 0 00-1.594-1.594 9.337 9.337 0 00-2.452 4.121 9.38 9.38 0 00.372 2.625M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PostIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);
const LogoutIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);
const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
);
const AddIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);
const HomeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M2.25 12v9a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12" />
    </svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
// --- KẾT THÚC ICON SVG ---


const navItems = [
  { name: 'Bảng điều khiển', icon: DashboardIcon },
  { name: 'Quản lý sản phẩm', icon: ProductIcon },
  { name: 'Quản lý đơn hàng', icon: OrderIcon },
  { name: 'Quản lý người dùng', icon: UserIconSvg },
  { name: 'Quản lý bài viết', icon: PostIcon },
  { name: 'Trang Chủ', icon: HomeIcon },
];

interface AdminPageProps {
  currentUser: User;
  onLogout: () => void;
  onViewSite: () => void;
  products: Product[];
  onAddProduct: (request: CreateProductRequest) => void;
  onUpdateProduct: (productId: number, request: CreateProductRequest) => void;
  onDeleteProduct: (productId: number) => void;
  orders: Order[];
  // SỬA: Hàm onUpdateOrderStatus giờ nhận trạng thái GỐC (BE status)
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

// === SỬA LỖI LOGIC HIỂN THỊ TỒN KHO ===
const DashboardView: React.FC<{products: Product[]}> = ({products}) => (
    <>
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        </header>
        {/* ... (Các thẻ doanh số giữ nguyên) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--admin-bg-card)] p-6 rounded-2xl shadow-sm">
                <h3 className="text-[var(--admin-text-secondary)] text-sm font-medium">Doanh số theo thời gian</h3>
                <p className="text-3xl font-bold mt-1">289.999.000₫</p>
                <p className="text-green-500 text-sm font-semibold mt-1">30 ngày qua +5.2%</p>
                <div className="h-32 mt-4 flex items-end">
                <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="text-[var(--admin-text-accent)]"><path d="M0,70 C30,50 60,80 90,60 S150,20 180,50 S240,90 270,70 S300,40 300,40" stroke="currentColor" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
            </div>
            <div className="bg-[var(--admin-bg-card)] p-6 rounded-2xl shadow-sm">
                <h3 className="text-[var(--admin-text-secondary)] text-sm font-medium">Doanh thu theo sản phẩm</h3>
                <p className="text-3xl font-bold mt-1">205.999.000₫</p>
                <p className="text-red-500 text-sm font-semibold mt-1">30 ngày qua -1.8%</p>
                <div className="h-32 mt-4 flex items-end justify-around space-x-4">
                <div className="w-1/4 h-[60%] bg-[var(--admin-bg-accent)] bg-opacity-30 rounded-t-lg"></div>
                <div className="w-1/4 h-[40%] bg-[var(--admin-bg-accent)] bg-opacity-30 rounded-t-lg"></div>
                <div className="w-1/4 h-[80%] bg-[var(--admin-bg-accent)] bg-opacity-30 rounded-t-lg"></div>
                <div className="w-1/4 h-[70%] bg-[var(--admin-bg-accent)] bg-opacity-30 rounded-t-lg"></div>
                </div>
            </div>
        </div>
        <div className="bg-[var(--admin-bg-card)] p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Sản phẩm gần đây</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[var(--admin-text-secondary)] uppercase border-b border-[var(--admin-border-color)]">
                  <tr>
                    <th scope="col" className="px-6 py-3">Tên sản phẩm</th>
                    <th scope="col" className="px-6 py-3">Giá</th>
                    <th scope="col" className="px-6 py-3">Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => {
                    // SỬA: Tính tổng tồn kho từ variants, giống như ProductManagementView
                    const totalStock = product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
                    return (
                        <tr key={product.id} className="border-b border-[var(--admin-border-color)] last:border-b-0">
                          <td className="px-6 py-4 font-medium">{product.name}</td>
                          <td className="px-6 py-4">{product.price.toLocaleString('vi-VN')}₫</td>
                          {/* SỬA: Hiển thị totalStock đã tính toán */}
                          <td className="px-6 py-4">{totalStock}</td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
    </>
);
// === KẾT THÚC SỬA DASHBOARDVIEW ===

// ProductManagementView giữ nguyên
const ProductManagementView: React.FC<{
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onAddNew: () => void;
}> = ({ products, onEdit, onDelete, onAddNew }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tất cả');
    
    // State để theo dõi sản phẩm nào đang được mở
    const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

    const categories = ['Tất cả', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = categoryFilter === 'Tất cả' || product.category === categoryFilter;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, categoryFilter]);
    
    const inputStyles = "bg-[var(--admin-bg-card)] border border-[var(--admin-border-color)] rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 ring-[var(--admin-text-accent)]";

    // Hàm để toggle mở/đóng
    const handleToggleExpand = (productId: number) => {
        setExpandedProductId(prevId => (prevId === productId ? null : productId));
    };

    return (
        <>
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
                <button 
                    onClick={onAddNew}
                    className="bg-[var(--admin-button-bg)] text-[var(--admin-button-text)] font-bold py-2.5 px-5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                    <AddIcon />
                    <span>Thêm sản phẩm mới</span>
                </button>
            </header>

            <div className="bg-[var(--admin-bg-card)] p-6 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="text-[var(--admin-text-secondary)]" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên sản phẩm..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`${inputStyles} w-full pl-10`} 
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <select 
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className={`${inputStyles} w-full`}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[var(--admin-text-secondary)] uppercase border-b border-[var(--admin-border-color)]">
                      <tr>
                        <th scope="col" className="px-2 py-3 w-12"></th>
                        <th scope="col" className="px-6 py-3">Tên sản phẩm</th>
                        <th scope="col" className="px-6 py-3">Danh mục</th>
                        <th scope="col" className="px-6 py-3">Thương hiệu</th>
                        <th scope="col" className="px-6 py-3">Tổng tồn kho</th>
                        <th scope="col" className="px-6 py-3">Trạng thái</th>
                        <th scope="col" className="px-6 py-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const isExpanded = expandedProductId === product.id;
                        
                        // Lấy data từ variants (vì 'product' được map từ 'mapProductResponseToProduct')
                        const productVariants = product.variants || []; 
                        
                        // Tính toán lại dựa trên tất cả biến thể
                        const totalStock = productVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
                        const inStock = totalStock > 0;

                        return (
                          <React.Fragment key={product.id}>
                            {/* === HÀNG 1: SẢN PHẨM CHÍNH === */}
                            <tr className="border-b border-[var(--admin-border-color)] hover:bg-[var(--admin-bg-hover)]">
                              
                              {/* Nút Expand */}
                              <td className="px-2 py-4 text-center">
                                <button 
                                  onClick={() => handleToggleExpand(product.id)} 
                                  className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-main)] transition-colors"
                                  disabled={productVariants.length === 0}
                                  title={productVariants.length === 0 ? "Không có biến thể" : "Xem biến thể"}
                                >
                                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${productVariants.length === 0 ? 'opacity-30' : ''}`} />
                                </button>
                              </td>
                              
                              {/* Thông tin sản phẩm */}
                              <td className="px-6 py-4 font-medium flex items-center space-x-3">
                                <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-md object-cover"/>
                                <span>{product.name}</span>
                              </td>
                              <td className="px-6 py-4">{product.category}</td>
                              <td className="px-6 py-4">{product.brand}</td>
                              <td className="px-6 py-4">{totalStock}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {inStock ? 'Còn hàng' : 'Hết hàng'}
                                </span>
                              </td>
                              <td className="px-6 py-4 flex items-center space-x-3">
                                <button onClick={() => onEdit(product)} className="font-medium text-[var(--admin-text-accent)] hover:underline">Sửa</button>
                                <button onClick={() => onDelete(product)} className="font-medium text-red-500 hover:underline">Xóa</button>
                              </td>
                            </tr>
                            
                            {/* === HÀNG 2: CHI TIẾT BIẾN THỂ (ẨN/HIỆN) === */}
                            {isExpanded && (
                              <tr className="bg-[var(--admin-bg-hover)]">
                                <td colSpan={7} className="py-4 px-6 md:px-10 lg:px-16">
                                  <h4 className="text-sm font-bold text-[var(--admin-text-main)] mb-2 ml-1">Các biến thể</h4>
                                  <div className="border border-[var(--admin-border-color)] rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-[var(--admin-bg-card)] text-xs text-[var(--admin-text-secondary)] uppercase">
                                        <tr>
                                          <th scope="col" className="px-4 py-2 text-left">Tên biến thể</th>
                                          <th scope="col" className="px-4 py-2 text-left">SKU</th>
                                          <th scope="col" className="px-4 py-2 text-left">Giá</th>
                                          <th scope="col" className="px-4 py-2 text-left">Giá KM</th>
                                          <th scope="col" className="px-4 py-2 text-left">Tồn kho</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-[var(--admin-bg-card)]">
                                        {productVariants.map((variant) => (
                                          <tr key={variant.sku} className="border-t border-[var(--admin-border-color)]">
                                            <td className="px-4 py-3">{variant.name}</td>
                                            <td className="px-4 py-3 font-mono">{variant.sku}</td>
                                            <td className="px-4 py-3">{variant.price.toLocaleString('vi-VN')}₫</td>
                                            <td className="px-4 py-3">
                                              {variant.oldPrice ? `${variant.oldPrice.toLocaleString('vi-VN')}₫` : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">{variant.stockQuantity}</td>
                                          </tr>
                                        ))}
                                        {productVariants.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-[var(--admin-text-secondary)]">
                                                    Sản phẩm này chưa có biến thể nào. (Vui lòng bấm "Sửa" để thêm)
                                                </td>
                                            </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            </div>
        </>
    );
};


// ==========================================================
// === SỬA LỖI LOGIC: Thêm bộ chuyển đổi BE <-> VN ===
// ==========================================================

// Map Backend -> Tiếng Việt (Để HIỂN THỊ trong UI)
const BE_TO_VN_MAP: Record<OrderStatus, string> = {
    'PENDING_CONFIRMATION': 'Chờ xác nhận',
    'PROCESSING': 'Đang xử lý',
    'SHIPPING': 'Đang giao hàng',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'RETURNED': 'Đã trả hàng',
};

// Map Tiếng Việt -> Backend (Để GỬI ĐI khi admin chọn)
const VN_TO_BE_MAP: Record<string, OrderStatus> = {
    'Chờ xác nhận': 'PENDING_CONFIRMATION',
    'Đang xử lý': 'PROCESSING',
    'Đang giao hàng': 'SHIPPING',
    'Hoàn thành': 'COMPLETED',
    'Đã hủy': 'CANCELLED',
    'Đã trả hàng': 'RETURNED',
};

// Các trạng thái Tiếng Việt để admin chọn (sắp xếp theo ý muốn)
const VN_STATUSES_FOR_UI = [
    'Chờ xác nhận',
    'Đang xử lý',
    'Đang giao hàng',
    'Hoàn thành',
    'Đã hủy',
    'Đã trả hàng',
];
// --- KẾT THÚC LOGIC CHUYỂN ĐỔI ---


// OrderManagementView đã được cập nhật: Xóa cột SKU và sửa Colspan
const OrderManagementView: React.FC<{
    orders: Order[];
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}> = ({ orders, onUpdateStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    // Thêm state để theo dõi đơn hàng đang được mở
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const inputStyles = "bg-[var(--admin-bg-card)] border border-[var(--admin-border-color)] rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 ring-[var(--admin-text-accent)]";

    // SỬA: Đã xóa 'orderStatuses' cũ, giờ dùng 'VN_STATUSES_FOR_UI'

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            
            // ==================================
            // === SỬA LỖI LOGIC FILTER Ở ĐÂY ===
            // ==================================
            // 1. Lấy trạng thái GỐC (BE status) từ order
            const beStatus = order.status; 
            // 2. Chuyển nó sang Tiếng Việt (VN status) để so sánh
            const vnStatus = BE_TO_VN_MAP[beStatus] || 'Không rõ';
            // ==================================
            
            // 3. So sánh VN status với statusFilter (cũng là Tiếng Việt)
            const matchesStatus = statusFilter === 'Tất cả' || vnStatus === statusFilter;
            const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [orders, searchTerm, statusFilter]);

    // SỬA: Hàm này giờ nhận trạng thái GỐC (BE Status)
    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
          case 'COMPLETED': return 'bg-green-500/20 text-green-400';
          case 'SHIPPING': return 'bg-blue-500/20 text-blue-400';
          case 'PROCESSING': return 'bg-yellow-500/20 text-yellow-400';
          case 'PENDING_CONFIRMATION': return 'bg-gray-500/20 text-gray-400';
          case 'CANCELLED': return 'bg-red-500/20 text-red-400';
          case 'RETURNED': return 'bg-red-500/20 text-red-400';
          default: return 'bg-gray-500/20 text-gray-400';
        }
    };
    
    const getPaymentStatusClass = (status: Order['paymentStatus']) => {
        return status === 'Đã thanh toán' ? 'text-green-400' : 'text-yellow-400';
    };

    const handleToggleExpand = (orderId: string) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    };


    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
            </header>
            <div className="bg-[var(--admin-bg-card)] p-6 rounded-2xl shadow-sm">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="text-[var(--admin-text-secondary)]" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Tìm theo Mã đơn hàng hoặc Tên..." 
                            value={searchTerm}
                            // SỬA LỖI TYPO: e.g.value -> e.target.value
                            onChange={e => setSearchTerm(e.target.value)} 
                            className={`${inputStyles} w-full pl-10`} 
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <select 
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className={`${inputStyles} w-full`}
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            {/* SỬA: Dùng VN_STATUSES_FOR_UI để tạo options */}
                            {VN_STATUSES_FOR_UI.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[var(--admin-text-secondary)] uppercase border-b border-[var(--admin-border-color)]">
                      <tr>
                        {/* Thêm cột cho nút expand */}
                        <th scope="col" className="px-2 py-3 w-12"></th>
                        <th scope="col" className="px-6 py-3">Mã đơn hàng</th>
                        <th scope="col" className="px-6 py-3">Khách hàng</th>
                        <th scope="col" className="px-6 py-3">Ngày đặt</th>
                        <th scope="col" className="px-6 py-3">Tổng tiền</th>
                        <th scope="col" className="px-6 py-3">Thanh toán</th>
                        <th scope="col" className="px-6 py-3">Trạng thái ĐH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        // Giả định Order có thuộc tính items: [{ productName, sku, price, quantity, size, flavor, image }]
                        const orderItems = (order as any).items || []; 

                        // ==================================
                        // === SỬA LỖI LOGIC HIỂN THỊ Ở ĐÂY ===
                        // ==================================
                        // 1. Lấy trạng thái GỐC (BE status)
                        const currentBeStatus = order.status; 
                        // 2. Chuyển sang Tiếng Việt (VN status) để hiển thị
                        const currentVnStatus = BE_TO_VN_MAP[currentBeStatus] || 'Không rõ';
                        // ==================================

                        return (
                          <React.Fragment key={order.id}>
                            {/* === HÀNG 1: THÔNG TIN ĐƠN HÀNG === */}
                            <tr className="border-b border-[var(--admin-border-color)] hover:bg-[var(--admin-bg-hover)]">
                              
                              {/* Nút Expand */}
                              <td className="px-2 py-4 text-center">
                                <button 
                                  onClick={() => handleToggleExpand(order.id)} 
                                  className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-main)] transition-colors"
                                  disabled={orderItems.length === 0}
                                  title={orderItems.length === 0 ? "Không có chi tiết" : "Xem chi tiết"}
                                >
                                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${orderItems.length === 0 ? 'opacity-30' : ''}`} />
                                </button>
                              </td>

                              <td className="px-6 py-4 font-mono text-[var(--admin-text-accent)]">{order.id}</td>
                              <td className="px-6 py-4 font-medium">{order.customer.name}</td>
                              <td className="px-6 py-4">{order.date}</td>
                              <td className="px-6 py-4">{order.total.toLocaleString('vi-VN')}₫</td>
                              <td className={`px-6 py-4 font-semibold ${getPaymentStatusClass(order.paymentStatus)}`}>{order.paymentStatus}</td>
                              <td className="px-6 py-4">
                                <select 
                                    // SỬA: Hiển thị giá trị Tiếng Việt (currentVnStatus)
                                    value={currentVnStatus} 
                                    
                                    onChange={(e) => {
                                        // 1. Lấy giá trị Tiếng Việt từ dropdown
                                        const vnValue = e.target.value;
                                        // 2. Chuyển sang trạng thái GỐC (BE status)
                                        const beStatusToSend = VN_TO_BE_MAP[vnValue];
                                        
                                        if (beStatusToSend) {
                                            console.log(`[STATUS_UPDATE] Gửi ID: ${order.id}, Trạng thái BE: ${beStatusToSend}`);
                                            // 3. Gửi trạng thái GỐC đi
                                            onUpdateStatus(order.id, beStatusToSend);
                                        }
                                    }}
                                    
                                    // SỬA: Dùng trạng thái GỐC (currentBeStatus) để lấy class CSS
                                    className={`text-xs font-semibold rounded-md p-1.5 border-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg-card)] focus:ring-[var(--admin-text-accent)] ${getStatusClass(currentBeStatus)}`}
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                  {/* SỬA: Dùng VN_STATUSES_FOR_UI để tạo options */}
                                  {VN_STATUSES_FOR_UI.map(s => <option key={s} value={s} className="bg-[var(--admin-bg-card)] text-[var(--admin-text-main)]">{s}</option>)}
                                </select>
                              </td>
                            </tr>
                            
                            {/* === HÀNG 2: CHI TIẾT SẢN PHẨM (ẨN/HIỆN) === */}
                            {isExpanded && (
                              <tr className="bg-[var(--admin-bg-hover)]">
                                {/* Colspan là 7 (1 nút + 6 cột info) */}
                                <td colSpan={7} className="py-4 px-6 md:px-10 lg:px-16">
                                  <h4 className="text-sm font-bold text-[var(--admin-text-main)] mb-2 ml-1">Chi tiết đơn hàng</h4>
                                  <div className="border border-[var(--admin-border-color)] rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-[var(--admin-bg-card)] text-xs text-[var(--admin-text-secondary)] uppercase">
                                        <tr>
                                          <th className="px-4 py-2 text-left">Sản phẩm</th>
                                          {/* ĐÃ XÓA SKU */}
                                          <th className="px-4 py-2 text-left">Đơn giá</th>
                                          <th className="px-4 py-2 text-left">Số lượng</th>
                                          <th className="px-4 py-2 text-left">Thành tiền</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-[var(--admin-bg-card)]">
                                        {orderItems.map((item: any) => (
                                          <tr key={item.sku} className="border-t border-[var(--admin-border-color)]">
                                            
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <img 
                                                        src={item.image || (orderItems.length > 0 && orderItems[0]?.image) || ''} 
                                                        alt={item.productName || item.sku} 
                                                        className="w-8 h-8 rounded-md object-cover"
                                                    />
                                                    {/* SỬA LỖI FALLBACK: Ưu tiên ProductName > Name > SKU */}
                                                    <span className="font-medium text-[var(--admin-text-main)]">
                                                        {item.productName || item.name || `SKU: ${item.sku || 'Không rõ'}`}
                                                    </span>
                                                </div>
                                                {(item.size || item.flavor) && (
                                                    <p className="text-xs text-[var(--admin-text-secondary)] mt-1 ml-11"> 
                                                        {item.size && `Kích cỡ: ${item.size}`}
                                                        {item.size && item.flavor && ` | `} 
                                                        {item.flavor && `Hương vị: ${item.flavor}`}
                                                    </p>
                                                )}
                                            </td>
                                            
                                            {/* ĐÃ XÓA SKU: <td className="px-4 py-3 font-mono">{item.sku || 'N/A'}</td> */}
                                            
                                            <td className="px-4 py-3">{item.price.toLocaleString('vi-VN')}₫</td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3 font-semibold">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                            </td>
                                          </tr>
                                        ))}
                                        {orderItems.length === 0 && (
                                            <tr>
                                                {/* Cập nhật Colspan từ 5 xuống 4 */}
                                                <td colSpan={4} className="text-center py-4 text-[var(--admin-text-secondary)]">
                                                    Đơn hàng này không có chi tiết sản phẩm.
                                                </td>
                                            </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            </div>
        </>
    );
};
// === KẾT THÚC SỬA ORDERMANAGEMENTVIEW ===


const ComingSoonPage: React.FC<{ title: string }> = ({ title }) => (
    <>
        <header className="mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
        </header>
        <div className="bg-[var(--admin-bg-card)] p-10 rounded-2xl shadow-sm text-center">
            <h2 className="text-2xl font-bold text-[var(--admin-text-main)]">Sắp ra mắt!</h2>
            <p className="text-[var(--admin-text-secondary)] mt-2">Tính năng này đang được phát triển. Vui lòng quay lại sau.</p>
        </div>
    </>
);


const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onLogout, onViewSite, products, onAddProduct, onUpdateProduct, onDeleteProduct, orders, onUpdateOrderStatus }) => {
  const [activePage, setActivePage] = useState('Bảng điều khiển');
  const [theme, setTheme] = useState<Theme>('default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const body = document.body;
    body.className = ''; // Clear all existing classes
    if (theme === 'default') {
        // The default styles are applied without a class
    } else {
        body.classList.add(`admin-theme-${theme}`);
    }

    return () => {
        body.className = 'bg-gym-darker text-white'; // Cleanup back to default site theme
    }
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
            setIsThemeMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleAddNewClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    onDeleteProduct(productToDelete.id);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
  };

  const handleNavClick = (name: string) => {
    if (name === 'Trang Chủ') {
      onViewSite();
    } else {
      setActivePage(name);
    }
  };

  const renderContent = () => {
    switch (activePage) {
        case 'Quản lý sản phẩm':
            return <ProductManagementView 
                        products={products} 
                        onEdit={handleEditClick} 
                        onDelete={handleDeleteClick} 
                        onAddNew={handleAddNewClick}
                    />;
        case 'Quản lý đơn hàng':
            return <OrderManagementView orders={orders} onUpdateStatus={onUpdateOrderStatus} />;
        case 'Quản lý người dùng':
        case 'Quản lý bài viết':
            return <ComingSoonPage title={activePage} />;
        case 'Bảng điều khiển':
        default:
            return <DashboardView products={products} />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-[var(--admin-bg-main)] text-[var(--admin-text-main)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[var(--admin-bg-sidebar)] p-4 flex flex-col rounded-r-2xl shadow-lg">
        <div className="flex items-center space-x-3 p-2 mb-6">
          <div className="w-12 h-12 bg-[var(--admin-bg-accent)] rounded-full flex items-center justify-center font-bold text-[var(--admin-text-accent-strong)] text-xl">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm">GymSUP Admin</p>
            <p className="text-xs text-[var(--admin-text-secondary)]">admin@gymsup.com</p>
          </div>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.name;
              return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavClick(item.name)}
                  className={`flex items-center w-full space-x-3 py-3 px-4 my-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--admin-bg-accent)] text-[var(--admin-text-accent-strong)] font-bold'
                      : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)]'
                  }`}
                >
                  <Icon />
                  <span>{item.name}</span>
                </button>
              </li>
            )})}
          </ul>
        </nav>
        <div className="mt-auto">
          <button onClick={onLogout} className="w-full bg-[var(--admin-button-bg)] text-[var(--admin-button-text)] font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
            <LogoutIcon />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Global Header Elements */}
          <div className="flex justify-end items-center mb-4 -mt-4">
              <div ref={themeMenuRef} className="relative">
                  <button 
                      onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                      className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-accent)] transition-colors p-2"
                      aria-label="Đổi giao diện"
                  >
                      <PaletteIcon className="h-6 w-6" />
                  </button>
                  {isThemeMenuOpen && (
                      <div className="absolute right-0 mt-3 w-36 bg-[var(--admin-bg-card)] border border-[var(--admin-border-color)] rounded-md shadow-lg z-50 animate-fade-in py-1">
                          <ul>
                              <li><button onClick={() => { setTheme('default'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm ${theme === 'default' ? 'bg-[var(--admin-bg-accent)] text-[var(--admin-text-accent-strong)]' : 'hover:bg-[var(--admin-bg-hover)]'}`}>Mặc định</button></li>
                              <li><button onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm ${theme === 'light' ? 'bg-[var(--admin-bg-accent)] text-[var(--admin-text-accent-strong)]' : 'hover:bg-[var(--admin-bg-hover)]'}`}>Trắng</button></li>
                              <li><button onClick={() => { setTheme('black'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm ${theme === 'black' ? 'bg-[var(--admin-bg-accent)] text-[var(--admin-text-accent-strong)]' : 'hover:bg-[var(--admin-bg-hover)]'}`}>Đen</button></li>
                          </ul>
                      </div>
                  )}
              </div>
          </div>
          {renderContent()}
        </div>
      </main>

      <AddProductModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddProduct={onAddProduct}
        onUpdateProduct={onUpdateProduct}
        productToEdit={productToEdit}
      />
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name || ''}
      />
    </div>
  );
};

export default AdminPage;