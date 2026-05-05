"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, X, ExternalLink, Instagram, Facebook, Music2, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  template: { 
    id: string; 
    name: string; 
    description: string; 
    required_platforms: string[]; 
    looker_studio_url?: string;
    thumbnail_url?: string;
    preview_images?: string[];
    category: string;
    metrics_included?: string[];
  };
  onClose: () => void;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  platform_username: string | null;
}

export function TemplateModal({ template, onClose }: Props) {
  const [using, setUsing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  const platformConfig: Record<string, { icon: any; color: string; label: string }> = {
    instagram: { icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500", label: "Instagram" },
    facebook: { icon: Facebook, color: "bg-blue-600", label: "Facebook" },
    tiktok: { icon: Music2, color: "bg-black", label: "TikTok" },
  };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch("/api/connections");
        const data = await res.json();
        setConnectedAccounts(data.connections || []);
      } catch (err) {
        console.error("Failed to fetch connections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getMissingPlatforms = () => {
    const connectedPlatforms = connectedAccounts.map(acc => acc.platform);
    return template.required_platforms.filter(platform => !connectedPlatforms.includes(platform));
  };

  const missingPlatforms = getMissingPlatforms();
  const hasAllPlatforms = missingPlatforms.length === 0;

  const handleUse = async () => {
    if (!hasAllPlatforms) {
      showToast("Please connect " + missingPlatforms.join(", ") + " first", "error");
      return;
    }

    setUsing(true);
    try {
      const res = await fetch("/api/templates/" + template.id + "/use", { method: "POST" });
      const data = await res.json();
      
      if (data.lookerStudioUrl) {
        window.open(data.lookerStudioUrl, "_blank");
        showToast("Template opened in Looker Studio!", "success");
        setTimeout(() => onClose(), 1500);
      } else {
        showToast("Looker Studio URL not configured for this template.", "error");
      }
    } catch (err) {
      showToast("Error activating template. Please try again.", "error");
    } finally {
      setUsing(false);
    }
  };

  const handleConnectPlatform = () => {
    window.location.href = "/dashboard/connections";
  };

  const handlePreview = () => {
    if (template.looker_studio_url) {
      window.open(template.looker_studio_url, "_blank");
    }
  };

  const previewImages = template.preview_images && template.preview_images.length > 0 
    ? template.preview_images 
    : template.thumbnail_url 
    ? [template.thumbnail_url] 
    : [];

  const nextImage = () => {
    setSelectedPreviewIndex((prev) => (prev + 1) % previewImages.length);
  };

  const prevImage = () => {
    setSelectedPreviewIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Scrollable Content Area */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            
            {/* Left Side - Image Gallery */}
            <div className="lg:w-1/2 bg-gray-50 p-6 flex flex-col">
              {previewImages.length > 0 ? (
                <>
                  {/* Main Preview Image */}
                  <div className="relative flex-1 bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                    <img 
                      key={selectedPreviewIndex}
                      src={previewImages[selectedPreviewIndex]} 
                      alt={template.name + " preview"}
                      className="w-full h-full object-contain transition-opacity duration-300 ease-in-out"
                      style={{ animation: 'fadeIn 0.3s ease-in-out' }}
                    />
                    
                    {/* Navigation Arrows */}
                    {previewImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110 cursor-pointer"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110 cursor-pointer"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {previewImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {previewImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPreviewIndex(idx)}
                          className={"shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ease-in-out cursor-pointer " + (selectedPreviewIndex === idx ? "border-indigo-600 ring-2 ring-indigo-200 scale-105" : "border-gray-200 hover:border-indigo-300 hover:scale-105")}
                        >
                          <img src={img} alt={"Preview " + (idx + 1)} className="w-full h-full object-cover transition-transform duration-200" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white rounded-xl">
                  <span className="text-6xl">📊</span>
                </div>
              )}
            </div>

            {/* Right Side - Details with Inner Scroll */}
            <div className="lg:w-1/2 flex flex-col">
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Template Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{template.name}</h2>

                {/* About This Template */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">About this template</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                </div>

                {/* Works With & Destination */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Works with</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.required_platforms.map(platform => {
                        const config = platformConfig[platform];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <div key={platform} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg">
                            <div className={"w-5 h-5 rounded flex items-center justify-center " + config.color}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{config.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Destination</h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-lg w-fit">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Looker Studio</span>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
                  <span className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {template.category === "social-media" ? "Social Media" : "Paid Ads"}
                  </span>
                </div>

                {/* Suggested Metrics - Horizontal Chips */}
                {template.metrics_included && template.metrics_included.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggested metrics</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.metrics_included.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                          <span className="text-xs font-medium text-indigo-700 capitalize">{metric.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connection Status Warning */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : !hasAllPlatforms && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm mb-1">Connection Required</p>
                      <p className="text-sm text-amber-700">
                        Please connect <span className="font-medium">{missingPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")}</span> to use this template.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Action Buttons at Bottom */}
              <div className="border-t border-gray-200 p-6 bg-white">
                <div className="flex gap-3">
                  <button 
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  {hasAllPlatforms ? (
                    <button 
                      onClick={handleUse} 
                      disabled={using} 
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      {using ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          Use this template
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={handleConnectPlatform}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      Connect Platforms
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {toast && (
        <div className="fixed bottom-4 right-4 z-[70]">
          <div className={"px-4 py-3 rounded-lg shadow-lg text-white font-medium " + (toast.type === "success" ? "bg-green-500" : "bg-red-500")}>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
