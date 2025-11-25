import React from 'react';
import HeroSection, { HeroSlide } from './HeroSection';
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
  // Lấy 4 sản phẩm mới nhất/phổ biến nhất
  const trendingProducts = products.slice(0, 4);

  // =======================================================
  // 👇 SỬA LẠI LOGIC LỌC (DÙNG ID ĐỂ GOM CẢ CHA LẪN CON)
  // =======================================================
  
  // ID 1: Whey Protein (Lấy cả sản phẩm có categoryId = 1 HOẶC parentCategoryId = 1)
  const wheyProducts = products.filter(p => 
      Number(p.categoryId) === 1 || Number(p.parentCategoryId) === 1
  ).slice(0, 8); // Tăng lên 8 xem cho đã mắt

  // ID 4: Tăng sức mạnh (Lấy cả sản phẩm có categoryId = 4 HOẶC parentCategoryId = 4)
  const strengthProducts = products.filter(p => 
      Number(p.categoryId) === 4 || Number(p.parentCategoryId) === 4
  ).slice(0, 8);
  // =======================================================

  const heroSlides: HeroSlide[] = [];
  const slideProducts = products.slice(0, 4);

  slideProducts.forEach(p => {
      if (p) {
          heroSlides.push({
              product: p,
              categoryLabel: p.brand,
              title: p.name,
              backgroundImage: p.images[0] || 'https://via.placeholder.com/1920x600'
          });
      }
  });

  return (
    <>
      <HeroSection slides={heroSlides} onProductSelect={onProductSelect} />

      <div className="container mx-auto px-4 space-y-16 py-12">
        <TrendingProducts products={trendingProducts} onProductSelect={onProductSelect} />
        
        <CategorySection 
          title="WHEY PROTEIN"
          categoryKey="Whey Protein"
          // Danh sách nút bấm danh mục con
          subCategories={['Whey Protein Blend', 'Whey Protein Isolate', 'Hydrolyzed Whey', 'Vegan Protein', 'Protein Bar']}
          products={wheyProducts}
          onProductSelect={onProductSelect}
          onCategorySelect={onCategorySelect}
        />
        
        <CategorySection 
          title="TĂNG SỨC MẠNH"
          categoryKey="Tăng sức mạnh"
          // Danh sách nút bấm danh mục con
          subCategories={['Pre-workout', 'Creatine', 'BCAA / EAA']}
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