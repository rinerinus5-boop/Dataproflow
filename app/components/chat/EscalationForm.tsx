"use client";

import { useState } from "react";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { HELP_TYPES, DESTINATIONS, DATA_SOURCES } from "@/lib/types/support";

interface EscalationFormProps {
  conversationId: string | null;
  defaultEmail?: string;
  defaultName?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function EscalationForm({
  conversationId,
  defaultEmail = "",
  defaultName = "",
  onComplete,
  onCancel,
}: EscalationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    helpType: "",
    destination: "",
    dataSource: "",
    name: defaultName,
    email: defaultEmail,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/chat/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          helpType: formData.helpType,
          destination: formData.destination,
          dataSource: formData.dataSource,
          name: formData.name,
          email: formData.email,
        }),
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
  };

  const renderDropdown = (
    field: string,
    label: string,
    options: readonly string[],
    value: string
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === field ? null : field)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-border rounded-full text-sm text-left hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value || `Select ${label.toLowerCase()}`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              openDropdown === field ? "rotate-180" : ""
            }`}
          />
        </button>
        {openDropdown === field && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(field, option)}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gray-50">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="text-xs text-primary font-medium">
          DataProFlow Support AI agent
        </p>
        <p className="text-sm text-foreground mt-1">
          Before I connect you with a human agent, please leave some more details so we can help you faster!
        </p>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {step === 1 && (
          <>
            {renderDropdown("helpType", "How can we help?", HELP_TYPES, formData.helpType)}
            <p className="text-xs text-muted-foreground">{step} of {totalSteps}</p>
            <button
              onClick={handleNext}
              disabled={!formData.helpType}
              className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {renderDropdown("destination", "Destination", DESTINATIONS, formData.destination)}
            <p className="text-xs text-muted-foreground">{step} of {totalSteps}</p>
            <button
              onClick={handleNext}
              disabled={!formData.destination}
              className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </>
        )}

        {step === 3 && (
          <>
            {renderDropdown("dataSource", "Data Source", DATA_SOURCES, formData.dataSource)}
            <p className="text-xs text-muted-foreground">{step} of {totalSteps}</p>
            <button
              onClick={handleNext}
              disabled={!formData.dataSource}
              className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white border border-border rounded-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground">{step} of {totalSteps}</p>
            <button
              onClick={handleNext}
              disabled={!formData.name}
              className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </>
        )}

        {step === 5 && (
          <>
            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">How can we help?</p>
                <p className="text-muted-foreground">{formData.helpType}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Destination</p>
                <p className="text-muted-foreground">{formData.destination}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Data Source</p>
                <p className="text-muted-foreground">{formData.dataSource}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Name</p>
                <p className="text-primary">{formData.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white border border-border rounded-full text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground">{step} of {totalSteps}</p>
            <button
              onClick={handleSubmit}
              disabled={!formData.email || isSubmitting}
              className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
