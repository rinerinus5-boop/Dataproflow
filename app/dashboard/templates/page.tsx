"use client";

import { useEffect, useState } from "react";
import { TemplateCard } from "./TemplateCard";
import { TemplateSkeletonGrid } from "./TemplateSkeleton";
import { Search } from "lucide-react";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  required_platforms: string[];
  is_featured: boolean;
  looker_studio_url?: string;
  thumbnail_url?: string;
  preview_images?: string[];
  metrics_included?: string[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter(t => {
    const matchesCategory = filter === "all" || t.category === filter;
    const matchesSearch = searchQuery === "" || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Clean Banner */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-16 rounded-2xl overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: 'url(/template-bg.png)' }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find the best template for your report
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                placeholder="Search templates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with Count and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All templates <span className="text-gray-500 font-normal">({filtered.length} {filtered.length === 1 ? 'template' : 'templates'})</span>
            </h2>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200">
          {["all", "social-media", "ppc"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2.5 font-medium text-sm cursor-pointer border-b-2 -mb-px transition-all duration-300 ease-in-out ${
                filter === cat 
                  ? "border-primary text-primary scale-105" 
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {cat === "all" ? "All" : cat === "social-media" ? "Social Media" : "Paid Ads"}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <TemplateSkeletonGrid />
        ) : filtered.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Featured templates</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(t => <TemplateCard key={t.id} template={t} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No templates match your search "${searchQuery}"`
                : "No templates available in this category"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
