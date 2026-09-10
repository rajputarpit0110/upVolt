import React, { useEffect, useState } from 'react';
import { Hero } from '../components/home/Hero';
import { TrustStrip } from '../components/home/TrustStrip';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { MakerReels } from '../components/home/MakerReels';
import { MentorsSection } from '../components/home/MentorsSection';
import { GuidanceBanner } from '../components/home/GuidanceBanner';
import { StatsBar } from '../components/home/StatsBar';
import { fetchProducts } from '../services/productService';
import { PRODUCTS } from '../data/mockProducts';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(({ products: liveProducts }) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="cc-page cc-page--home">
      <Hero />
      <TrustStrip />
      <CategoryGrid />
      <FeaturedSection products={products} loading={loading} />
      <MakerReels />
      <MentorsSection />
      <GuidanceBanner />
      <StatsBar />
    </div>
  );
};
