// src/components/admin/AddProductModal.tsx
import React, { useState, useEffect } from 'react';
import { Product, CreateProductRequest, ProductVariantRequest } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (request: CreateProductRequest) => void;
  onUpdateProduct: (productId: number, request: CreateProductRequest) => void;
  productToEdit: Product | null;
}

type VariantFormState = Omit<ProductVariantRequest, 'price' | 'stockQuantity' | 'salePrice'> & {
  price: string;
  stockQuantity: string;
  salePrice: string;
};

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  productToEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [brandId, setBrandId] = useState<number>(0);
  const [error, setError] = useState('');
  const [variantsState, setVariantsState] = useState<VariantFormState[]>([]);

  const isEditMode = !!productToEdit;

  const inputStyles =
    "w-full px-3 py-2 bg-[var(--admin-bg-card)] border border-[var(--admin-border-color)] rounded-md text-[var(--admin-text-main)] placeholder-[var(--admin-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]";
  const smallInputStyles =
    "w-full px-2 py-1.5 text-sm bg-[var(--admin-bg-card)] border border-[var(--admin-border-color)] rounded-md text-[var(--admin-text-main)] placeholder-[var(--admin-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]";

  useEffect(() => {
    if (isOpen) {
      console.log('productToEdit:', productToEdit);

      if (isEditMode && productToEdit) {
        // CHẾ ĐỘ CHỈNH SỬA
        setName(productToEdit.name);
        setDescription(productToEdit.description || '');
        setCategoryId(productToEdit.categoryId || 0);
        setBrandId(productToEdit.brandId || 0);

        const variantsFromProduct = productToEdit.variants.map(v => ({
          name: v.name,
          sku: v.sku,
          price: String(v.price),
          salePrice: String(v.oldPrice || ''),
          stockQuantity: String(v.stock_quantity),
        }));

        setVariantsState(variantsFromProduct);
      } else {
        // CHẾ ĐỘ THÊM MỚI
        console.log('RESET FORM THÊM MỚI');
        setName('');
        setDescription('');
        setCategoryId(0);
        setBrandId(0);
        setVariantsState([
          { name: '', sku: '', price: '', stockQuantity: '', salePrice: '' },
        ]);
      }
      setError('');
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleAddVariantRow = () => {
    setVariantsState([
      ...variantsState,
      { name: '', sku: '', price: '', stockQuantity: '', salePrice: '' },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variantsState.length <= 1) return;
    const newVariants = [...variantsState];
    newVariants.splice(index, 1);
    setVariantsState(newVariants);
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormState,
    value: string
  ) => {
    const newVariants = variantsState.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariantsState(newVariants);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Tên sản phẩm là bắt buộc.');
    if (categoryId === 0) return setError('Chọn danh mục.');
    if (brandId === 0) return setError('Chọn thương hiệu.');

    const finalVariants: ProductVariantRequest[] = [];
    let errorMessage = '';

    for (const v of variantsState) {
      const t = {
        name: v.name.trim(),
        sku: v.sku.trim(),
        price: v.price.trim(),
        stockQuantity: v.stockQuantity.trim(),
        salePrice: v.salePrice.trim(),
      };

      if (!t.name) {
        errorMessage = 'Tên biến thể bắt buộc';
        break;
      }
      if (!t.sku) {
        errorMessage = 'SKU bắt buộc';
        break;
      }
      if (!t.price || isNaN(Number(t.price))) {
        errorMessage = 'Giá không hợp lệ';
        break;
      }
      if (Number(t.price) <= 0) {
        errorMessage = 'Giá phải > 0';
        break;
      }
      if (!t.stockQuantity || isNaN(Number(t.stockQuantity))) {
        errorMessage = 'Tồn kho không hợp lệ';
        break;
      }
      if (t.salePrice && isNaN(Number(t.salePrice))) {
        errorMessage = 'Giá KM không hợp lệ';
        break;
      }

      finalVariants.push({
        name: t.name,
        sku: t.sku,
        price: Number(t.price),
        salePrice: t.salePrice ? Number(t.salePrice) : undefined,
        stockQuantity: Number(t.stockQuantity),
      });
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    if (finalVariants.length === 0) {
      setError('Phải có ít nhất 1 biến thể');
      return;
    }

    const payload: CreateProductRequest = {
      name: name.trim(),
      description: description.trim() || null,
      categoryId: categoryId,
      brandId: brandId,
      variants: finalVariants,
    };

    console.log('GỬI PAYLOAD:', payload);

    try {
      if (isEditMode && productToEdit) {
        onUpdateProduct(productToEdit.id, payload);
      } else {
        onAddProduct(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-bg-main)] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-[var(--admin-border-color)]">
          <h2 className="text-2xl font-bold text-[var(--admin-text-main)]">
            {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-grow overflow-y-auto p-6 space-y-6"
        >
          {/* Thông tin chung */}
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                Tên sản phẩm (Chung)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputStyles}
                placeholder="ví dụ: Myprotein Impact Whey Protein"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Danh mục
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(Number(e.target.value))}
                  className={inputStyles}
                >
                  <option value={0}>Chọn danh mục</option>
                  <option value={1}>Whey Protein</option>
                  <option value={2}>Pre-Workout</option>
                  <option value={3}>Tăng cân</option>
                  <option value={4}>Tăng sức mạnh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                  Thương hiệu
                </label>
                <select
                  value={brandId}
                  onChange={e => setBrandId(Number(e.target.value))}
                  className={inputStyles}
                >
                  <option value={0}>Chọn thương hiệu</option>
                  <option value={1}>Optimum Nutrition</option>
                  <option value={2}>C4</option>
                  <option value={3}>MyProtein</option>
                  <option value={4}>GymSup</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className={inputStyles}
                placeholder="Viết mô tả chi tiết..."
              ></textarea>
            </div>
          </section>

          <hr className="border-t border-[var(--admin-border-color)]" />

          {/* Variants */}
          <section>
            <h3 className="text-lg font-semibold text-[var(--admin-text-main)] mb-3">
              Các biến thể (SKUs)
            </h3>
            <div className="space-y-4">
              {variantsState.map((variant, index) => (
                <div
                  key={index}
                  className="bg-[var(--admin-bg-card)] p-4 rounded-lg border border-[var(--admin-border-color)] space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[var(--admin-text-secondary)]">
                      Biến thể {index + 1}
                    </label>
                    {variantsState.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="text-red-500 hover:text-red-400 text-xs font-semibold"
                      >
                        XÓA
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                        Tên biến thể
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={e =>
                          handleVariantChange(index, 'name', e.target.value)
                        }
                        className={smallInputStyles}
                        placeholder="ví dụ: Vị Chocolate 1kg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={e =>
                          handleVariantChange(index, 'sku', e.target.value)
                        }
                        className={smallInputStyles}
                        placeholder="ví dụ: MP-WHEY-CHOC-1KG"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                        Giá (đ)
                      </label>
                      <input
                        type="text"
                        value={variant.price}
                        onChange={e =>
                          handleVariantChange(index, 'price', e.target.value)
                        }
                        className={smallInputStyles}
                        placeholder="650000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                        Giá khuyến mãi (nếu có)
                      </label>
                      <input
                        type="text"
                        value={variant.salePrice}
                        onChange={e =>
                          handleVariantChange(index, 'salePrice', e.target.value)
                        }
                        className={smallInputStyles}
                        placeholder="600000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                        Tồn kho
                      </label>
                      <input
                        type="text"
                        value={variant.stockQuantity}
                        onChange={e =>
                          handleVariantChange(index, 'stockQuantity', e.target.value)
                        }
                        className={smallInputStyles}
                        placeholder="120"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddVariantRow}
                className="w-full text-sm font-bold text-[var(--admin-text-accent)] border-2 border-dashed border-[var(--admin-border-color)] rounded-lg py-2.5 hover:bg-[var(--admin-bg-hover)] transition-colors"
              >
                + Thêm biến thể
              </button>
            </div>
          </section>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </form>

        <div className="flex justify-end items-center space-x-4 p-6 border-t border-[var(--admin-border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 text-sm font-bold text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-main)] transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-[var(--admin-button-bg)] text-[var(--admin-button-text)] font-bold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            {isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
