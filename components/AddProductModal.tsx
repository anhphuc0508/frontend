// src/components/admin/AddProductModal.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: any) => void;
  onUpdateProduct: (product: any) => void;
  productToEdit: Product | null;
}

const subCategoryMap: { [key: string]: string[] } = {
  "Whey Protein": [
    "Whey Protein Blend",
    "Whey Protein Isolate",
    "Hydrolyzed Whey",
    "Vegan Protein",
    "Protein Bar",
    "Meal Replacements",
  ],
};

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  productToEdit,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [brandId, setBrandId] = useState<number>(0);
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const isEditMode = !!productToEdit;

  const inputStyles = "w-full px-3 py-2 bg-[var(--admin-bg-card)] border border-[var(--admin-border-color)] rounded-md text-[var(--admin-text-main)] placeholder-[var(--admin-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]";

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && productToEdit) {
        setSku(productToEdit.sku || '');
        setName(productToEdit.name);
        setPrice(String(productToEdit.price));
        setStock(String(productToEdit.total || 0));
        setImage(productToEdit.images[0] || '');
        setCategoryId(productToEdit.categoryId || 0);
        setBrandId(productToEdit.brandId || 0);
        setSubCategory(productToEdit.subCategory || '');
        setDescription(productToEdit.description || '');
      } else {
        setSku('');
        setName('');
        setPrice('');
        setStock('');
        setImage('');
        setCategoryId(0);
        setBrandId(0);
        setSubCategory('');
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, productToEdit, isEditMode]);

  useEffect(() => {
    setSubCategory('');
  }, [categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sku.trim()) return setError('SKU là bắt buộc.');
    if (!name.trim()) return setError('Tên sản phẩm là bắt buộc.');
    if (!price.trim() || isNaN(Number(price))) return setError('Giá phải là số hợp lệ.');
    if (!stock.trim() || isNaN(Number(stock))) return setError('Tồn kho phải là số hợp lệ.');
    if (!image.trim()) return setError('URL hình ảnh là bắt buộc.');
    if (categoryId === 0) return setError('Chọn danh mục.');
    if (brandId === 0) return setError('Chọn thương hiệu.');

    const payload = {
      name,
      description,
      categoryId,
      brandId,
      variants: [
        {
          name: `${name} - ${subCategory || 'Default'}`,
          sku,
          price: Number(price),
          salePrice: null,
          stockQuantity: Number(stock),
        },
      ],
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi thêm sản phẩm');
      }

      const data = await res.json();
      onAddProduct(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-bg-main)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--admin-text-main)] mb-6">
            {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Tên sản phẩm</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyles} placeholder="ví dụ: Optimum Nutrition Gold Standard 100% Whey" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">ID (SKU)</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} className={inputStyles} placeholder="ví dụ: ON-GSW-5LB" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Danh mục</label>
                <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className={inputStyles}>
                  <option value={0}>Chọn danh mục</option>
                  <option value={1}>Whey Protein</option>
                  <option value={2}>Pre-Workout</option>
                  <option value={3}>Tăng cân</option>
                  <option value={4}>Tăng sức mạnh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Thương hiệu</label>
                <select value={brandId} onChange={e => setBrandId(Number(e.target.value))} className={inputStyles}>
                  <option value={""}>Chọn thương hiệu</option>
                  <option value={1}>Optimum Nutrition</option>
                  <option value={2}>C4</option>
                  <option value={3}>MyProtein</option>
                  <option value={4}>GymSup</option>
                </select>
              </div>
            </div>

            {categoryId === 1 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Danh mục phụ</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className={inputStyles}>
                  <option value="">Chọn danh mục phụ</option>
                  {subCategoryMap["Whey Protein"].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Giá (đ)</label>
                <input type="text" value={price} onChange={e => setPrice(e.target.value)} className={inputStyles} placeholder="ví dụ: 1850000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Tồn kho</label>
                <input type="text" value={stock} onChange={e => setStock(e.target.value)} className={inputStyles} placeholder="ví dụ: 150" required />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">URL hình ảnh</label>
              <input type="text" value={image} onChange={e => setImage(e.target.value)} className={inputStyles} placeholder="https://example.com/image.png" required />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Mô tả</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputStyles} placeholder="Viết mô tả chi tiết..."></textarea>
            </div>

            {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

            <div className="flex justify-end items-center space-x-4 pt-4">
              <button type="button" onClick={onClose} className="py-2 px-5 text-sm font-bold text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-main)] transition-colors">
                Hủy
              </button>
              <button type="submit" className="bg-[var(--admin-button-bg)] text-[var(--admin-button-text)] font-bold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity">
                {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;