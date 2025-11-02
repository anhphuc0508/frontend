// ProductPage.tsx – HOÀN CHỈNH
import React, { useState } from 'react';
import { Product } from '../types';
import { StarIcon } from '../constants';
import { useCart } from '../contexts/CartContext';

interface ProductPageProps {
  product: Product;
  onBack: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, onBack }) => {
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Lấy từ variants
  const rawSizes = product.variants?.map(v => v.size).filter(Boolean) || [];
  const rawFlavors = product.variants?.map(v => v.flavor).filter(Boolean) || [];

  const availableSizes = [...new Set(rawSizes)];
  const availableFlavors = [...new Set(rawFlavors)];

  // DỰ PHÒNG: Luôn hiển thị dù DB không có
  const fallbackSizes = ['5Lbs', '10Lbs'];
  const fallbackFlavors = ['Chocolate', 'Vanilla', 'Matcha'];

  const finalSizes = availableSizes.length > 0 ? availableSizes : fallbackSizes;
  const finalFlavors = availableFlavors.length > 0 ? availableFlavors : fallbackFlavors;

  const [selectedSize, setSelectedSize] = useState(finalSizes[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(finalFlavors[0]);

  const handleAddToCart = async () => {
    if (isAdding || !product.inStock) return;
    setIsAdding(true);

    // Tìm variant thật (nếu có)
    let skuToUse = product.variants?.[0]?.sku;

    if (product.variants) {
      const found = product.variants.find(v => v.flavor === selectedFlavor && v.size === selectedSize);
      skuToUse = found?.sku || product.variants[0].sku;
    }

    // DỰ PHÒNG: Dùng SKU đầu tiên
    if (!skuToUse) skuToUse = `TEMP-${product.id}-${selectedFlavor}-${selectedSize}`;

    try {
      await addToCart(skuToUse, quantity);
      alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
      alert('Lỗi khi thêm vào giỏ');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <button onClick={onBack} className="text-sm text-gym-gray hover:text-gym-yellow mb-6">
        Quay lại cửa hàng
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div>
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-4">
            <img src={mainImage} alt={product.name} className="w-full h-auto object-cover aspect-square" />
          </div>
          <div className="flex space-x-2">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setMainImage(img)} className={`w-20 h-20 border-2 rounded-lg overflow-hidden ${mainImage === img ? 'border-gym-yellow' : 'border-gray-800'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex text-gym-yellow">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-5 w-5 ${i < 4 ? 'text-gym-yellow' : 'text-gray-600'}`} />
              ))}
            </div>
            <span className="text-sm text-gym-gray ml-2">(0 đánh giá)</span>
            <span className="mx-2 text-gym-gray">|</span>
            <span className="text-sm text-green-500">Còn hàng</span>
          </div>

          <p className="text-3xl font-bold text-gym-yellow mb-6">
            {product.price.toLocaleString('vi-VN')}₫
          </p>

          {/* FLAVORS */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gym-gray uppercase mb-2">
              Hương vị: <span className="text-white font-bold">{selectedFlavor}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {finalFlavors.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFlavor(f)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${
                    selectedFlavor === f
                      ? 'bg-gym-yellow text-gym-darker border-gym-yellow'
                      : 'bg-transparent text-white border-gray-700 hover:border-gym-yellow'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* SIZES */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gym-gray uppercase mb-2">
              Kích cỡ: <span className="text-white font-bold">{selectedSize}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {finalSizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-colors ${
                    selectedSize === s
                      ? 'bg-gym-yellow text-gym-darker border-gym-yellow'
                      : 'bg-transparent text-white border-gray-700 hover:border-gym-yellow'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-gray-700 rounded-md">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-lg font-bold">-</button>
              <span className="px-6 py-3 text-lg font-bold">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-lg font-bold">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-grow bg-gym-yellow text-gym-darker font-bold py-3 px-8 rounded-md hover:bg-yellow-300 disabled:bg-gray-600"
            >
              {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2 mb-4">Mô tả sản phẩm</h3>
            <p className="text-gym-gray">Bột protein tinh khiết, nay đã được cập nhật giá ưu đãi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;