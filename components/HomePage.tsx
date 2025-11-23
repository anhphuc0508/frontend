// File: src/components/HomePage.tsx (ĐÃ SỬA LỖI KẸT SLIDE)
import React from 'react';
import HeroSection, { HeroSlide } from './HeroSection'; // Import HeroSlide
import TrendingProducts from './TrendingProducts';
import CategorySection from './CategorySection';
import KnowledgeSection from './KnowledgeSection';
import { supplementArticles, nutritionArticles } from '../constants';
import { Product } from '../types';

interface HomePageProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onCategorySelect: (category: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ products, onProductSelect, onCategorySelect }) => {
  const trendingProducts = products.slice(0, 4);
  const wheyProducts = products.filter(p => p.category === 'Whey Protein').slice(0, 6);
  const strengthProducts = products.filter(p => p.category === 'Tăng sức mạnh').slice(0, 6);

  // =======================================================
  // === SỬA LỖI KẸT SLIDE: Lấy 2 sản phẩm BẤT KỲ ===
  // =======================================================
  
  // Thay vì tìm ID 1 và 7, chúng ta lấy 2 sản phẩm đầu tiên
  // mà API trả về (nếu có)
  const product1 = products[0];
  const product2 = products[1];
  const product3 = products[2];
  const product4 = products[3];

  const heroSlides: HeroSlide[] = [];

  // Nếu có sản phẩm đầu tiên, tạo slide 1
  if (product1) {
    heroSlides.push({
      product: product1,
      categoryLabel: product1.brand, // Tự động lấy tên thương hiệu
      title: product1.name,       // Tự động lấy tên sản phẩm
      // Tự động lấy ảnh đầu tiên của sản phẩm làm nền
      backgroundImage: product1.images[0] 
    });
  }

  // Nếu có sản phẩm thứ hai, tạo slide 2
  if (product2) {
    heroSlides.push({
      product: product2,
      categoryLabel: product2.brand,
      title: product2.name,
      backgroundImage: product2.images[0] 
    });
  }
  // === KẾT THÚC SỬA LỖI ===
  if (product3) {
    heroSlides.push({
      product: product3,
      categoryLabel: product3.brand,
      title: product3.name,
      backgroundImage: product3.images[0] 
    });
  if (product4) {
    heroSlides.push({
      product: product4,
      categoryLabel: product4.brand,
      title: product4.name,
      backgroundImage: product4.images[0] 
    });
  }
  }
  return (
    <>
      {/* Giờ HeroSection sẽ nhận slide (khi products đã tải) 
        hoặc mảng rỗng (khi products đang tải) một cách chính xác 
      */}
      <HeroSection slides={heroSlides} onProductSelect={onProductSelect} />

      <div className="container mx-auto px-4 space-y-16 py-12">
        <TrendingProducts products={trendingProducts} onProductSelect={onProductSelect} />
        <CategorySection 
          title="WHEY PROTEIN"
          categoryKey="Whey Protein"
          subCategories={['Whey Protein Blend', 'Whey Protein Isolate', 'Hydrolyzed Whey', 'Vegan Protein', 'Protein Bar']}
          products={wheyProducts}
          onProductSelect={onProductSelect}
          onCategorySelect={onCategorySelect}
        />
        <CategorySection 
          title="TĂNG SỨC MẠNH"
          categoryKey="Tăng sức mạnh"
          subCategories={['Pre-Workout', 'Creatine', 'Intra-Workout', 'BCAAs']}
          products={strengthProducts}
          onProductSelect={onProductSelect}
          onCategorySelect={onCategorySelect}
        />
        <KnowledgeSection 
          supplementArticles={supplementArticles}
          nutritionArticles={nutritionArticles}
        />
      </div>
    </>
  );
};

export default HomePage;