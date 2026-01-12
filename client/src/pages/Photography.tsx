/*
 * Design Philosophy: Atmospheric Immersion
 * - Gallery-style presentation inspired by high-end art galleries
 * - Full-bleed layouts with careful sequencing
 * - Emphasis on image quality and scale
 * - Minimal text interference
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Photo {
  id: number;
  src: string;
  title: string;
  location: string;
  year: string;
  description: string;
  camera?: string;
  lens?: string;
  settings?: string;
}

// Fallback static photos for when database is empty
const staticPhotos: Photo[] = [
  {
    id: 1,
    src: "/images/DSCF3114.JPG",
    title: "Winter Solitude",
    location: "Isle of Skye, Scotland",
    year: "2024",
    description: "Snow-covered peaks under a pale winter sky, where silence speaks louder than words.",
  },
  {
    id: 2,
    src: "/images/image7.jpg",
    title: "Edge of the World",
    location: "Seven Sisters, England",
    year: "2024",
    description: "Where chalk cliffs meet the sea, two figures walk toward the infinite horizon.",
  },
  {
    id: 3,
    src: "/images/image1.jpg",
    title: "Turquoise Waters",
    location: "Étretat, France",
    year: "2024",
    description: "A lone kayaker navigates the crystal waters beneath ancient limestone cliffs.",
  },
  {
    id: 4,
    src: "/images/image5.jpg",
    title: "Threshold",
    location: "York, England",
    year: "2024",
    description: "An elderly man pauses at the doorway, caught between shadow and light.",
  },
  {
    id: 5,
    src: "/images/image2.jpg",
    title: "Florentine Light",
    location: "Florence, Italy",
    year: "2024",
    description: "The Duomo's intricate facade glows in the golden hour, as crowds gather below.",
  },
  {
    id: 6,
    src: "/images/image3.jpg",
    title: "Roman Passage",
    location: "Rome, Italy",
    year: "2024",
    description: "The Pantheon stands eternal, as modern life flows past its ancient columns.",
  },
];

export default function Photography() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Fetch photos from database
  const { data: dbPhotos, isLoading } = trpc.photos.list.useQuery({});

  // Transform database photos to display format, fallback to static if empty
  const photos = useMemo(() => {
    if (dbPhotos && dbPhotos.length > 0) {
      return dbPhotos.map(p => ({
        id: p.id,
        src: p.imageUrl,
        title: p.title,
        location: p.location || "",
        year: p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : new Date().getFullYear().toString(),
        description: p.description || "",
        camera: p.camera || undefined,
        lens: p.lens || undefined,
        settings: p.settings || undefined,
      }));
    }
    return staticPhotos;
  }, [dbPhotos]);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = "auto";
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % photos.length
        : (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[newIndex]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-6 mb-16">
          <div className="h-12 w-64 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`bg-white/10 rounded animate-pulse ${
                  i === 1 || i === 4 ? "md:col-span-2 aspect-[21/9]" : "aspect-[4/5]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 mb-16"
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
          Photography
        </h1>
        <p className="font-body text-lg text-white/60 max-w-2xl">
          A collection of moments captured across landscapes and cities, 
          exploring the interplay of light, form, and human presence.
        </p>
      </motion.div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-6">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No photos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative cursor-pointer overflow-hidden ${
                  index === 0 || index === 3 ? "md:col-span-2" : ""
                }`}
                onMouseEnter={() => setHoveredId(photo.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => openLightbox(photo)}
              >
                <div
                  className={`relative ${
                    index === 0 || index === 3
                      ? "aspect-[21/9]"
                      : "aspect-[4/5]"
                  } overflow-hidden`}
                >
                  <motion.img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredId === photo.id ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  
                  {/* Hover Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === photo.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-black/40 flex items-end p-6 md:p-8"
                  >
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl text-white mb-2">
                        {photo.title}
                      </h3>
                      <p className="font-nav text-sm text-white/70 tracking-wide">
                        {photo.location} {photo.location && photo.year && "·"} {photo.year}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50"
            >
              <X size={28} />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("prev");
              }}
              className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors z-50"
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePhoto("next");
              }}
              className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors z-50"
            >
              <ChevronRight size={40} />
            </button>

            {/* Image and Info */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl max-h-[90vh] mx-4 flex flex-col md:flex-row items-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[70vh] md:max-h-[80vh] w-auto object-contain"
              />
              <div className="text-center md:text-left md:max-w-xs">
                <h2 className="font-display text-3xl text-white mb-2">
                  {selectedPhoto.title}
                </h2>
                <p className="font-nav text-sm text-white/60 tracking-wide mb-4">
                  {selectedPhoto.location} {selectedPhoto.location && selectedPhoto.year && "·"} {selectedPhoto.year}
                </p>
                <p className="font-body text-white/70 leading-relaxed mb-4">
                  {selectedPhoto.description}
                </p>
                {/* Camera Info */}
                {(selectedPhoto.camera || selectedPhoto.lens || selectedPhoto.settings) && (
                  <div className="text-sm text-white/40 space-y-1 border-t border-white/10 pt-4">
                    {selectedPhoto.camera && <p>📷 {selectedPhoto.camera}</p>}
                    {selectedPhoto.lens && <p>🔭 {selectedPhoto.lens}</p>}
                    {selectedPhoto.settings && <p>⚙️ {selectedPhoto.settings}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
