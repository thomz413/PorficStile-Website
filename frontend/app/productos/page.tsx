"use client";

import { useState, useEffect } from "react";
import { getProducts, getCategories } from "@/lib/strapi";
import ProductCard from "@/components/ProductCard";
import StickyCart from "@/components/StickyCart";
import { Producto, StrapiCategory } from "@/lib/strapi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Filter, Grid, List } from "lucide-react";
import Header from "@/components/Header";

export default function ProductsPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<StrapiCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { convertAndFormatPrice } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoria?.nombre === selectedCategory)
    : products;

  const handleCategoryFilter = async (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nuestros Productos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra colección exclusiva de ropa premium peruana con diseño único y calidad excepcional.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in animation-delay-200">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover-scale ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Todos
            </button>
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.nombre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover-scale animation-delay-${(index + 3) * 100}`}
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                {category.nombre}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-end mb-6 animate-fade-in animation-delay-500">
            <div className="flex gap-2 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-float" />
              <h3 className="text-lg font-medium mb-2">
                {selectedCategory
                  ? `No hay productos en "${selectedCategory}"`
                  : "No hay productos disponibles"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Intenta seleccionar otra categoría o ajusta los filtros.
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    className={viewMode === "list" ? "flex flex-row" : ""}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Sticky Cart */}
      <StickyCart />
    </main>
  );
}
