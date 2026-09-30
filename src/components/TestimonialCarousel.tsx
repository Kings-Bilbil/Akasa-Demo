"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface Props {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
}

export default function TestimonialCarousel({ children, direction = "left", speed = 1 }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const requestRef = useRef<number>(0);

  // Fungsi untuk infinite loop manual scroll
  const handleInfiniteScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth } = carouselRef.current;
    
    // Asumsi: anak-anak (children) sudah diduplikasi sehingga scrollWidth = 2x lebar asli
    const halfWidth = scrollWidth / 2;

    if (scrollLeft >= halfWidth) {
      carouselRef.current.scrollLeft = scrollLeft - halfWidth;
    } else if (scrollLeft <= 0) {
      carouselRef.current.scrollLeft = scrollLeft + halfWidth;
    }
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!carouselRef.current || isDragging) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      if (direction === "left") {
        carouselRef.current.scrollLeft += speed;
      } else {
        carouselRef.current.scrollLeft -= speed;
      }
      
      handleInfiniteScroll();
      
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, isDragging, speed, handleInfiniteScroll]);

  // Drag handlers (Mouse)
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    
    let newScrollLeft = scrollLeft - walk;
    const halfWidth = carouselRef.current.scrollWidth / 2;

    if (newScrollLeft <= 0) {
      newScrollLeft += halfWidth;
      setStartX(x);
      setScrollLeft(newScrollLeft);
    } else if (newScrollLeft >= halfWidth) {
      newScrollLeft -= halfWidth;
      setStartX(x);
      setScrollLeft(newScrollLeft);
    }

    carouselRef.current.scrollLeft = newScrollLeft;
  };
  
  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };
  
  const onTouchEnd = () => {
    setIsDragging(false);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    
    let newScrollLeft = scrollLeft - walk;
    const halfWidth = carouselRef.current.scrollWidth / 2;

    if (newScrollLeft <= 0) {
      newScrollLeft += halfWidth;
      setStartX(x);
      setScrollLeft(newScrollLeft);
    } else if (newScrollLeft >= halfWidth) {
      newScrollLeft -= halfWidth;
      setStartX(x);
      setScrollLeft(newScrollLeft);
    }

    carouselRef.current.scrollLeft = newScrollLeft;
  };

  return (
    <div
      ref={carouselRef}
      className={`testimonials__carousel ${direction === 'right' ? 'testimonials__carousel--reverse' : ''}`}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="testimonials__row">
        {children}
      </div>
    </div>
  );
}
