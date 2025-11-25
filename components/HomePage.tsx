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
  const trendingProducts = products.slice(0, 4);
  const wheyProducts = products.filter(p => p.category === 'Whey Protein').slice(0, 6);
  const strengthProducts = products.filter(p => p.category === 'Tăng sức mạnh').slice(0, 6);

  // =======================================================
  // === FIX LỖI SLIDE (Code gọn gàng) ===
  // =======================================================
  const heroSlides: HeroSlide[] = [];
  
  // Lấy 4 sản phẩm đầu tiên để làm slide
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
  // =======================================================

  return (
    <>
      <HeroSection slides={heroSlides} onProductSelect={onProductSelect} />

      <div className="container mx-auto px-4 space-y-16 py-12">
        <TrendingProducts products={trendingProducts} onProductSelect={onProductSelect} />
        
        <CategorySection 
          title="WHEY PROTEIN"
          categoryKey="Whey Protein"
          // 👇 Tên này phải khớp 100% với STATIC_CATEGORIES bên CategoryPage.tsx
          subCategories={[]}
          products={wheyProducts}
          onProductSelect={onProductSelect}
          onCategorySelect={onCategorySelect}
        />
        
        <CategorySection 
          title="TĂNG SỨC MẠNH"
          categoryKey="Tăng sức mạnh"
          // 👇 SỬA LẠI TÊN CHO KHỚP DATABASE
          // Sai: ['Pre-Workout', 'Creatine', 'Intra-Workout', 'BCAAs']
          // Đúng:
        subCategories={[]}
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