/*
 * Design Philosophy: Atmospheric Immersion
 * - Editorial reading experience inspired by The New Yorker
 * - Literary and contemplative typographic treatment
 * - Attention to readability, pacing, and hierarchy
 * - Clean, spacious layouts with generous margins
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Essay {
  id: number;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  coverImage: string;
}

// Fallback static essays
const staticEssays: Essay[] = [
  {
    id: 1,
    title: "The Art of Seeing",
    subtitle: "On Photography and Presence",
    excerpt:
      "In an age of infinite images, what does it mean to truly see? The camera becomes not just a tool for capture, but a lens through which we learn to inhabit the present moment more fully.",
    date: "December 2024",
    readTime: "12 min read",
    category: "Photography",
    coverImage: "/images/image7.jpg",
  },
  {
    id: 2,
    title: "Wandering Through Time",
    subtitle: "Reflections on European Architecture",
    excerpt:
      "Standing before the Pantheon, one feels the weight of two millennia pressing down through those ancient columns. Architecture, at its finest, is frozen music—a symphony in stone that plays across centuries.",
    date: "November 2024",
    readTime: "15 min read",
    category: "Travel",
    coverImage: "/images/image3.jpg",
  },
  {
    id: 3,
    title: "The Silence of Snow",
    subtitle: "A Winter Journey to the Scottish Highlands",
    excerpt:
      "There is a particular quality to highland silence in winter—not an absence of sound, but a presence of stillness so profound it becomes almost audible. The mountains hold their breath.",
    date: "October 2024",
    readTime: "10 min read",
    category: "Travel",
    coverImage: "/images/DSCF3114.JPG",
  },
  {
    id: 4,
    title: "Portraits of Strangers",
    subtitle: "The Ethics and Aesthetics of Street Photography",
    excerpt:
      "Every photograph of a stranger is an act of both intimacy and intrusion. We capture moments that belong to others, freezing their private gestures into our public narratives.",
    date: "September 2024",
    readTime: "18 min read",
    category: "Photography",
    coverImage: "/images/image5.jpg",
  },
];

const defaultCategories = ["All", "Photography", "Travel", "Culture", "Art"];

// Estimate read time from content
function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default function Magazine() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch essays from database
  const { data: dbEssays, isLoading } = trpc.essays.list.useQuery({});

  // Transform database essays to display format
  const essays = useMemo(() => {
    if (dbEssays && dbEssays.length > 0) {
      return dbEssays.map(e => ({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle || "",
        excerpt: e.excerpt || "",
        date: e.publishedAt 
          ? new Date(e.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        readTime: e.content ? estimateReadTime(e.content) : "5 min read",
        category: e.category || "Uncategorized",
        coverImage: e.coverImageUrl || "/images/image7.jpg",
      }));
    }
    return staticEssays;
  }, [dbEssays]);

  // Extract unique categories from essays
  const categories = useMemo(() => {
    const uniqueCategories = new Set(essays.map(e => e.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [essays]);

  const filteredEssays =
    selectedCategory === "All"
      ? essays
      : essays.filter((essay) => essay.category === selectedCategory);

  const handleReadMore = () => {
    toast("Coming Soon", {
      description: "Full article content will be available soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-6 mb-12">
          <div className="h-12 w-48 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="container mx-auto px-6 mb-12">
          <div className="flex gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-24 bg-white/10 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="container mx-auto px-6">
          <div className="aspect-[21/9] bg-white/10 rounded-lg animate-pulse mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-white/10 rounded-lg animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-4 bg-white/10 rounded animate-pulse w-2/3" />
              </div>
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
        className="container mx-auto px-6 mb-12"
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
          Magazine
        </h1>
        <p className="font-body text-lg text-white/60 max-w-2xl">
          Essays, reflections, and explorations on photography, travel, and the
          art of seeing the world with fresh eyes.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="container mx-auto px-6 mb-12"
      >
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`font-nav text-sm tracking-wider px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredEssays.length === 0 ? (
        <div className="container mx-auto px-6">
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No essays yet</p>
          </div>
        </div>
      ) : (
        <>
          {/* Featured Essay */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="container mx-auto px-6 mb-16"
          >
            <div
              className="relative overflow-hidden rounded-lg cursor-pointer group"
              onClick={handleReadMore}
            >
              <div className="aspect-[21/9] relative">
                <img
                  src={filteredEssays[0].coverImage}
                  alt={filteredEssays[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <span className="font-nav text-xs tracking-widest uppercase text-white/60 mb-3 block">
                    Featured
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-2">
                    {filteredEssays[0].title}
                  </h2>
                  {filteredEssays[0].subtitle && (
                    <p className="font-display text-xl md:text-2xl italic text-white/80 mb-4">
                      {filteredEssays[0].subtitle}
                    </p>
                  )}
                  {filteredEssays[0].excerpt && (
                    <p className="font-body text-white/70 max-w-2xl mb-6 hidden md:block">
                      {filteredEssays[0].excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-white/50 font-nav text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {filteredEssays[0].date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {filteredEssays[0].readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Essay Grid */}
          {filteredEssays.length > 1 && (
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEssays.slice(1).map((essay, index) => (
                  <motion.article
                    key={essay.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={handleReadMore}
                  >
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="aspect-[4/3]">
                        <img
                          src={essay.coverImage}
                          alt={essay.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="font-nav text-xs tracking-wider px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white/80">
                          {essay.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-2xl text-white group-hover:text-white/80 transition-colors">
                        {essay.title}
                      </h3>
                      {essay.subtitle && (
                        <p className="font-display text-lg italic text-white/60">
                          {essay.subtitle}
                        </p>
                      )}
                      {essay.excerpt && (
                        <p className="font-body text-white/50 line-clamp-3">
                          {essay.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 text-white/40 font-nav text-xs">
                          <span>{essay.date}</span>
                          <span>·</span>
                          <span>{essay.readTime}</span>
                        </div>
                        <span className="text-white/50 group-hover:text-white transition-colors">
                          <ArrowRight size={18} />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
