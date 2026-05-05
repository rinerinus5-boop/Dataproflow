"use client";

import { useState } from "react";
import { TemplateModal } from "./TemplateModal";
import { Instagram, Facebook, Music2, Eye, ExternalLink } from "lucide-react";

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

export function TemplateCard({ template }: { template: Template }) {
  const [showModal, setShowModal] = useState(false);

  const platformConfig: Record<string, { icon: any; color: string; label: string }> = {
    instagram: { icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500", label: "Instagram" },
    facebook: { icon: Facebook, color: "bg-blue-600", label: "Facebook" },
    tiktok: { icon: Music2, color: "bg-black", label: "TikTok" },
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        {/* Thumbnail Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {template.thumbnail_url ? (
            <img 
              src={template.thumbnail_url} 
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-5xl">📊</span>
            </div>
          )}
          
          {/* Platform Badges - Top Right */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {template.required_platforms.map(platform => {
              const config = platformConfig[platform];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <div 
                  key={platform}
                  className={"w-8 h-8 rounded-lg flex items-center justify-center shadow-md " + config.color}
                  title={config.label}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
              );
            })}
          </div>

          {/* Category Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full shadow-sm">
              {template.category === "social-media" ? "Social Media" : "Paid Ads"}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1.5">{template.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.description}</p>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Use
            </button>
          </div>
        </div>
      </div>
      {showModal && <TemplateModal template={template} onClose={() => setShowModal(false)} />}
    </>
  );
}
