"use client";
import { carouselData } from "./carouselData";
import Image from "next/image";
import { useState, useEffect } from "react";



export function LoginImage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { images} = carouselData;

  // Automatic image change every 5 seconds with transition
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 500); // Fade out time
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  return (
    <div className="hidden lg:block lg:w-3/5 relative overflow-hidden">
      {/* Previous image (fading out) */}
      {isTransitioning && (
        <div className="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0">
          <Image
            src={images[prevIndex]}
            alt="Students using Coursify"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Current image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100
        }`}>
        <Image
          src={images[currentIndex]}
          alt="Students using Coursify"
          fill
          className="object-cover"
          priority
        />
      </div>

    
    </div>
  );
}
