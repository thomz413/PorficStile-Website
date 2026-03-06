"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Producto, Variante } from "@/lib/strapi/types/product";
import { getStrapiImageUrl } from "@/lib/strapi";

interface ProductGalleryProps {
  product: Producto;
  selectedVariant?: Variante | null;
  className?: string;
}

export default function ProductGallery({ product, selectedVariant, className = "" }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Build gallery array with variant image override logic
  const getGalleryImages = () => {
    const images: Array<{ url: string; name: string; alt?: string }> = [];

    // Priority: 1. Variant images, 2. imagenPrincipal, 3. galeria
    if (selectedVariant?.imagenes && selectedVariant.imagenes.length > 0) {
      // Add variant images first
      selectedVariant.imagenes.forEach((img) => {
        images.push({
          url: getStrapiImageUrl(img.url),
          name: img.name,
          alt: img.name || `${product.nombre} - ${selectedVariant.talla}${selectedVariant.color ? ` - ${selectedVariant.color}` : ''}`,
        });
      });
    }

    // Add imagenPrincipal if exists and not already added
    if (product.imagenPrincipal?.url) {
      const alreadyAdded = selectedVariant?.imagenes.some(
        (img) => img.url === product.imagenPrincipal?.url
      );
      if (!alreadyAdded) {
        images.push({
          url: getStrapiImageUrl(product.imagenPrincipal.url),
          name: product.imagenPrincipal.name || "",
          alt: product.imagenPrincipal.name || product.nombre || "",
        });
      }
    }

    // Add galeria images
    if (product.galeria && product.galeria.length > 0) {
      product.galeria.forEach((img) => {
        const alreadyAdded = images.some(
          (existingImg) => existingImg.url === img.url
        );
        if (!alreadyAdded) {
          images.push({
            url: getStrapiImageUrl(img.url),
            name: img.name ?? "",
            alt: img.name ?? product.nombre ?? "",
          });
        }
      });
    }

    return images.length > 0 ? images : [{
      url: "https://placehold.co/600x600?text=No+Imagen",
      name: "No Image",
      alt: product.nombre ?? "",
    }];
  };

  const gallery = getGalleryImages();

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    } else if (e.key === "Escape") {
      setIsZoomed(false);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: any) => handleKeyDown(e);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [currentIndex, gallery.length, isZoomed]);

  if (gallery.length === 0) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-square flex items-center justify-center">
          <span className="text-gray-500">No hay imágenes disponibles</span>
        </div>
      </div>
    );
  }

  const currentImage = gallery[currentIndex];

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-square group">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || ''}
          fill
          className={`object-cover transition-all duration-300 cursor-zoom-in ${
            isZoomed ? "scale-150" : "scale-100 hover:scale-105"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentIndex === 0}
        />

        {/* Zoom Button */}
        <button
          onClick={toggleZoom}
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label={isZoomed ? "Cerrar zoom" : "Abrir zoom"}
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Navigation Arrows */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {gallery.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {gallery.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? "border-blue-500 scale-105"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              aria-label={`Ver imagen ${index + 1} de ${gallery.length}`}
            >
              <Image
                src={image.url}
                alt={image.alt || ''}
                fill
                className="object-cover"
                sizes="64px"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {gallery.length > 1 && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
          {currentIndex + 1} / {gallery.length}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={toggleZoom}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={currentImage.url}
              alt={currentImage.alt || ''}
              width={1200}
              height={800}
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
