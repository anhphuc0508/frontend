// File: src/components/AccountPage.tsx

import React, { useState } from 'react';
import { User } from '../types';
import api from '../lib/axios'; // 👇 1. Nhớ import cái này để gọi Backend

interface AccountPageProps {
  currentUser: User;
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ currentUser, onBack }) => {
  const [fullName, setFullName] = useState(currentUser.name);
  // ... (Giữ nguyên các state email, phone...)
  const [email, setEmail] = useState(currentUser.name.toLowerCase().replace(' ','.') + '.vip234@email.com');
  const [phone, setPhone] = useState('0987654321');

  // State mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 👇 2. Sửa hàm này thành ASYNC để gọi API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate cơ bản (Giữ nguyên)
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại.' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
        return;
      }

      // --- BẮT ĐẦU GỌI BACKEND ---
      try {
          // Gọi API đổi mật khẩu (Giả sử Backend bạn đã làm endpoint này)
          await api.put('/users/change-password', {
              oldPassword: currentPassword,
              newPassword: newPassword
          });

          setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
          
          // Reset form sau khi thành công
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');

      } catch (err: any) {
          console.error(err);
          // Lấy lỗi từ Backend trả về (ví dụ: "Mật khẩu cũ không đúng")
          const errorMsg = err.response?.data || err.response?.data?.message || 'Lỗi đổi mật khẩu';
          setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : 'Có lỗi xảy ra' });
      }
      // --- KẾT THÚC GỌI BACKEND ---

    } else {
        // Trường hợp chỉ cập nhật thông tin cá nhân (Họ tên, SĐT...)
        // Bạn cũng có thể gọi API cập nhật profile ở đây nếu muốn
        setMessage({ type: 'success', text: 'Thông tin cá nhân đã được cập nhật (Demo)!' });
    }
  };
  
  // ... (Phần giao diện return bên dưới GIỮ NGUYÊN KHÔNG ĐỔI) ...
  const inputStyle = "w-full bg-gym-dark border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gym-yellow";
  const labelStyle = "block text-sm font-medium text-gym-gray mb-1";
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* ... (Giữ nguyên nội dung HTML cũ) ... */}
      <button onClick={onBack} className="text-sm text-gym-gray hover:text-gym-yellow mb-8">
        &larr; Quay lại trang chủ
      </button>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white tracking-wider text-center mb-10 uppercase">Tài khoản của tôi</h1>

        <form onSubmit={handleSubmit} className="bg-gym-dark p-8 rounded-lg shadow-lg space-y-8">
          {/* Personal Information Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className={labelStyle}>Họ và tên</label>
                <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className={inputStyle} required />
              </div>
              <div>
                <label htmlFor="email" className={labelStyle}>Email</label>
                <input type="email" id="email" value={email} className={`${inputStyle} bg-gym-darker cursor-not-allowed`} readOnly />
              </div>
              <div>
                <label htmlFor="phone" className={labelStyle}>Số điện thoại</label>
                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyle} />
              </div>
            </div>
          </section>

          {/* Change Password Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Đổi mật khẩu</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className={labelStyle}>Mật khẩu hiện tại</label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputStyle} placeholder="Bỏ trống nếu không đổi" />
              </div>
              <div>
                <label htmlFor="newPassword" className={labelStyle}>Mật khẩu mới</label>
                <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputStyle} placeholder="Bỏ trống nếu không đổi"/>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelStyle}>Xác nhận mật khẩu mới</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputStyle} placeholder="Bỏ trống nếu không đổi"/>
              </div>
            </div>
          </section>
          
          {message && (
             <p className={`text-sm text-center font-semibold ${message.type === 'success' ? 'text-green-400' : 'text-red-500'}`}>
                {message.text}
             </p>
          )}

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-gym-yellow text-gym-darker font-bold py-3 px-8 rounded-md hover:bg-yellow-300 transition-colors">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;