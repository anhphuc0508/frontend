import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Order } from '../types';
import api from '../lib/axios'; // 1. Import axios instance

interface CheckoutPageProps {
  onBackToShop: () => void;
  // 2. Xóa prop onPlaceOrder vì component này sẽ tự gọi API
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToShop }) => {
  const { cartItems, itemCount, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  // 3. Tách state cho địa chỉ (để khớp với CreateOrderRequest.java)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); // Vẫn giữ email (dù backend không yêu cầu)
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState(''); // MỚI
  const [ward, setWard] = useState('');     // MỚI
  const [district, setDistrict] = useState(''); // MỚI
  const [city, setCity] = useState('');     // MỚI

  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Thêm loading state

  const subtotal: number = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee: number = 0; 
  const total: number = subtotal + shippingFee;

  // 4. Sửa lại hoàn toàn hàm handlePlaceOrder
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    // 4a. Build payload items (chỉ variantId và quantity)
    const itemsPayload = cartItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    // 4b. Build payload chính (khớp với CreateOrderRequest.java)
    const payload = {
      shippingFullName: fullName,
      shippingPhoneNumber: phone,
      shippingStreet: street,
      shippingWard: ward,
      shippingDistrict: district,
      shippingCity: city,
      paymentMethod: paymentMethod.toUpperCase(), // Gửi 'COD' hoặc 'CARD'
      items: itemsPayload,
      couponCode: null, // Sẽ thêm sau
    };

    try {
      // 4c. Gọi API (endpoint trong OrderController là "/api/v1/orders")
      // Giả sử axios instance của bạn có baseURL là "/api/v1"
      await api.post('/orders', payload);

      alert('Đặt hàng thành công! Cảm ơn bạn.');
      clearCart();
      onBackToShop(); // Quay về trang chủ

    } catch (err: any) {
      console.error("Lỗi đặt hàng:", err);
      // 4d. Hiển thị lỗi từ backend (ví dụ: "Không đủ tồn kho")
      const message = err.response?.data?.message || err.response?.data || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      alert(`Lỗi khi đặt hàng: ${message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const inputStyle = "w-full bg-gym-darker border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gym-yellow";

  return (
    <div className="container mx-auto px-4 py-12">
      <button onClick={onBackToShop} className="text-sm text-gym-gray hover:text-gym-yellow mb-8">
        &larr; Quay lại cửa hàng
      </button>
      <h1 className="text-4xl font-extrabold text-white tracking-wider text-center mb-10">THANH TOÁN</h1>

      {itemCount === 0 ? (
        // ... (phần giỏ hàng rỗng giữ nguyên)
        <div className="text-center bg-gym-dark p-10 rounded-lg">
          <p className="text-gym-gray text-lg">Giỏ hàng của bạn đang trống.</p>
          <button onClick={onBackToShop} className="mt-6 bg-gym-yellow text-gym-darker font-bold py-3 px-8 rounded-md hover:bg-yellow-300 transition-colors">
            Bắt đầu mua sắm
          </button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-12 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping Details */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gym-gray mb-1">Họ và tên</label>
                  <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className={inputStyle} placeholder="Nguyễn Văn A" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gym-gray mb-1">Email (Để nhận thông báo)</label>
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} placeholder="you@example.com" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gym-gray mb-1">Số điện thoại</label>
                  <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyle} placeholder="09xxxxxxxx" required />
                </div>
                
                {/* 5. SỬA LẠI FORM ĐỊA CHỈ */}
                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gym-gray mb-1">Số nhà, Tên đường</label>
                  <input type="text" id="street" value={street} onChange={e => setStreet(e.target.value)} className={inputStyle} placeholder="123 Đường ABC" required />
                </div>
                <div>
                  <label htmlFor="ward" className="block text-sm font-medium text-gym-gray mb-1">Phường / Xã</label>
                  <input type="text" id="ward" value={ward} onChange={e => setWard(e.target.value)} className={inputStyle} placeholder="Phường 10" required />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gym-gray mb-1">Quận / Huyện</label>
                  <input type="text" id="district" value={district} onChange={e => setDistrict(e.target.value)} className={inputStyle} placeholder="Quận 5" required />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gym-gray mb-1">Tỉnh / Thành phố</label>

                  <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} className={inputStyle} placeholder="TP. Hồ Chí Minh" required />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            {/* ... (Phần Payment Method giữ nguyên) ... */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Phương thức thanh toán</h2>
              <div className="mt-4 space-y-3">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-gym-yellow bg-gym-dark' : 'border-gray-700 bg-gym-darker'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-5 w-5 text-gym-yellow bg-gym-darker border-gray-600 focus:ring-gym-yellow" />
                  <span className="ml-4 text-white font-semibold">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-gym-yellow bg-gym-dark' : 'border-gray-700 bg-gym-darker'}`}>
                  <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-5 w-5 text-gym-yellow bg-gym-darker border-gray-600 focus:ring-gym-yellow" />
                  <span className="ml-4 text-white font-semibold">Thẻ Tín dụng/Ghi nợ</span>
                </label>

                {/* Conditional Credit Card Form */}
                {paymentMethod === 'card' && (
                  <div className="bg-gym-dark p-4 rounded-lg border border-gym-yellow/50 mt-3 space-y-4 animate-fade-in">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gym-gray mb-1">Số thẻ</label>
                      <input type="text" id="cardNumber" className={inputStyle} placeholder="0000 0000 0000 0000" required />
                    </div>
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gym-gray mb-1">Tên trên thẻ</label>
                      <input type="text" id="cardName" className={inputStyle} placeholder="NGUYEN VAN A" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gym-gray mb-1">Ngày hết hạn</label>
                        <input type="text" id="cardExpiry" className={inputStyle} placeholder="MM / YY" required />
                      </div>
                      <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-gym-gray mb-1">Mã bảo mật (CVV)</label>
                        <input type="text" id="cardCvv" className={inputStyle} placeholder="123" required />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column (Order Summary) */}
          <div className="lg:col-span-1">
            <aside className="bg-gym-dark rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Tóm tắt đơn hàng</h2>
              {/* ... (Phần Tóm tắt đơn hàng giữ nguyên) ... */}
              <ul className="space-y-4 my-4 max-h-64 overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <li key={item.sku} className="flex items-center space-x-4">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <span className="absolute -top-2 -right-2 bg-gym-yellow text-gym-darker text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-white font-semibold text-sm">{item.name}</p>
                      <p className="text-gym-gray text-xs">
                        {item.flavor && `${item.flavor}`}
                        {item.flavor && item.size && ' - '}
                        {item.size && `${item.size}`}
                      </p>
                    </div>
                    <p className="text-white font-semibold text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gym-gray">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gym-gray">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
                </div>
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-gym-yellow">{total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* 6. Cập nhật nút Đặt hàng */}
              <button 
                type="submit" 
                disabled={isPlacingOrder}
                className="w-full bg-gym-yellow text-gym-darker font-bold py-3 rounded-md hover:bg-yellow-300 transition-colors mt-6 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </aside>
          </div>
        </form>
      )}
    </div>
  );
};

export default CheckoutPage;
