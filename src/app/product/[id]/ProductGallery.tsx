'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

type ProductGalleryProps = {
  images: string[];
  name: string;
};

/**
 * Galeri produk interaktif:
 * - Thumbnail bisa diklik untuk ganti gambar utama.
 * - Panah kanan/kiri berfungsi (berputar dari ujung ke ujung).
 * - Klik gambar utama membuka lightbox (klik backdrop / X / Escape untuk tutup).
 */
export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const count = images.length;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const go = useCallback(
    (dir: number) => {
      if (count <= 1) return;
      setActive(a => (a + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, go]);

  if (count === 0) return null;

  const showNav = count > 1;

  return (
    <>
      <div className="product-detail__gallery">
        <div className="product-detail__main-image">
          <button
            type="button"
            className="gallery-main-btn"
            onClick={() => setLightbox(true)}
            aria-label="Perbesar gambar produk"
            title="Klik untuk memperbesar"
          >
            <Image
              key={images[active]}
              src={images[active]}
              alt={name}
              width={500}
              height={500}
              unoptimized
            />
          </button>
        </div>
        <div className="product-detail__thumbnails">
          {showNav && (
            <button
              type="button"
              className="gallery-nav gallery-nav--prev"
              aria-label="Gambar sebelumnya"
              onClick={() => go(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          {images.map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              className={`thumbnail${i === active ? ' active' : ''}`}
              aria-label={`Lihat gambar ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            >
              <Image src={src} alt={`Thumbnail ${i + 1}`} width={100} height={100} unoptimized />
            </button>
          ))}
          {showNav && (
            <button
              type="button"
              className="gallery-nav gallery-nav--next"
              aria-label="Gambar berikutnya"
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}
        </div>
      </div>

      {lightbox && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau ${name}`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            aria-label="Tutup pratinjau"
            onClick={() => setLightbox(false)}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          {showNav && (
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              aria-label="Gambar sebelumnya"
              onClick={e => { e.stopPropagation(); go(-1); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}
          <div className="gallery-lightbox__content" onClick={e => e.stopPropagation()}>
            <Image
              key={images[active]}
              src={images[active]}
              alt={name}
              width={1000}
              height={1000}
              unoptimized
            />
          </div>
          {showNav && (
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              aria-label="Gambar berikutnya"
              onClick={e => { e.stopPropagation(); go(1); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
