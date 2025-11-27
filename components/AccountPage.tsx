// File: src/components/AccountPage.tsx

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import api from '../lib/axios';

interface AccountPageProps {
  currentUser: User;
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ currentUser, onBack }) => {
  // Khởi tạo state từ currentUser
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  // Nếu currentUser chưa có phone thì để trống
  const [phone, setPhone] = useState(currentUser.phone || '');

  // State mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Đồng bộ lại dữ liệu khi currentUser thay đổi (ví dụ sau khi F5)
  useEffect(() => {
    if (currentUser) {
        setFullName(currentUser.name);
        setEmail(currentUser.email);
        setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
        // 1. XỬ LÝ ĐỔI MẬT KHẨU (Nếu có nhập)
        if (newPassword || confirmPassword || currentPassword) {
            if (!currentPassword) throw new Error('Vui lòng nhập mật khẩu hiện tại.');
            if (newPassword.length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
            if (newPassword !== confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');
            
           
             await api.put('/users/change-password', { oldPassword: currentPassword, newPassword });
            console.log("Đổi mật khẩu:", { currentPassword, newPassword });
        }

        // 2. XỬ LÝ CẬP NHẬT THÔNG TIN CÁ NHÂN (QUAN TRỌNG)
        // Tách họ tên để gửi về Backend (Do Backend lưu firstName, lastName riêng)
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        const payload = {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phone,
            email: email // Gửi luôn email nếu backend cho sửa
        };

        // Gọi API update profile
        const res = await api.put('/users/profile', payload);

        // 3. CẬP NHẬT LOCAL STORAGE
        // Để khi F5 lại trang, dữ liệu mới vẫn còn
        const savedUserJson = localStorage.getItem('user');
        if (savedUserJson) {
            const userObj = JSON.parse(savedUserJson);
            // Cập nhật các trường mới
            userObj.firstName = firstName;
            userObj.lastName = lastName;
            userObj.phoneNumber = phone;
            userObj.email = email;
            
            localStorage.setItem('user', JSON.stringify(userObj));
        }

        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });

        // Reset ô mật khẩu
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

    } catch (err: any) {
        console.error("Lỗi cập nhật:", err);
        const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.';
        setMessage({ type: 'error', text: errorMsg });
    } finally {
        setIsLoading(false);
    }
  };
  
  const inputStyle = "w-full bg-gym-dark border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gym-yellow transition-all";
  const labelStyle = "block text-sm font-medium text-gym-gray mb-1";
  
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm text-gym-gray hover:text-gym-yellow mb-8 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại trang chủ
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white tracking-wider text-center mb-10 uppercase">
            Tài khoản của tôi
        </h1>

        <form onSubmit={handleSubmit} className="bg-gym-darker p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-8">
          
          {/* Personal Information Section */}
          <section>
            <h2 className="text-xl font-bold text-gym-yellow mb-6 border-b border-gray-700 pb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className={labelStyle}>Họ và tên</label>
                <input 
                    type="text" 
                    id="fullName" 
                    value={fullName} 
                    className={inputStyle} 
                    readOnly 
                />
              </div>
              <div>
                <label htmlFor="email" className={labelStyle}>Email (Tên đăng nhập)</label>
                <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    className={`${inputStyle} bg-gray-800 text-gray-400 cursor-not-allowed`} 
                    readOnly 
                    title="Không thể thay đổi email"
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelStyle}>Số điện thoại</label>
                <input 
                    type="tel" 
                    id="phone" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className={inputStyle}
                    placeholder="09xx..." 
                />
              </div>
            </div>
          </section>

          {/* Change Password Section */}
          <section>
            <h2 className="text-xl font-bold text-gym-yellow mb-6 border-b border-gray-700 pb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Đổi mật khẩu
            </h2>
            <div className="space-y-4 bg-gym-dark p-6 rounded-xl border border-gray-700/50">
              <div>
                <label htmlFor="currentPassword" className={labelStyle}>Mật khẩu hiện tại</label>
                <input 
                    type="password" 
                    id="currentPassword" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    className={inputStyle} 
                    placeholder="Nhập mật khẩu cũ nếu muốn đổi mới" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="newPassword" className={labelStyle}>Mật khẩu mới</label>
                    <input 
                        type="password" 
                        id="newPassword" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className={inputStyle} 
                        placeholder="Tối thiểu 6 ký tự"
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className={labelStyle}>Xác nhận mật khẩu mới</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className={inputStyle} 
                        placeholder="Nhập lại mật khẩu mới"
                    />
                </div>
              </div>
            </div>
          </section>
          
          {/* Notification Message */}
          {message && (
             <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {message.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
                <span className="font-medium text-sm">{message.text}</span>
             </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-gym-yellow text-gym-darker font-bold py-3 px-8 rounded-md hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-400/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                  <svg className="animate-spin h-5 w-5 text-gym-darker" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              )}
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;