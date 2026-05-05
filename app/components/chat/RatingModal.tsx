"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface RatingModalProps {
  conversationId: string | null;
  onComplete: () => void;
  onSkip: () => void;
}

export default function RatingModal({
  conversationId,
  onComplete,
  onSkip,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/chat/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          rating,
          feedback: feedback || null,
        }),
      });
      onComplete();
    } catch (error) {
      console.error("Error submitting rating:", error);
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Rate your experience
          </h3>
          <button
            onClick={onSkip}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          How do you feel about your support experience with the DataProFlow team?
        </p>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Feedback */}
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Any additional feedback? (optional)"
          className="w-full px-4 py-3 border border-border rounded-xl text-sm resize-none h-24 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onSkip}
            className="flex-1 py-3 border border-border text-foreground rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating || isSubmitting}
            className="flex-1 py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Rate your experience"}
          </button>
        </div>
      </div>
    </div>
  );
}
