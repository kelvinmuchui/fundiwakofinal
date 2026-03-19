"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
  { label: "Plumbing", icon: "🔧" },
  { label: "Electrical", icon: "⚡" },
  { label: "Carpentry", icon: "🪚" },
  { label: "Painting", icon: "🎨" },
  { label: "Masonry", icon: "🧱" },
  { label: "Cleaning", icon: "🧹" },
  { label: "Roofing", icon: "🏠" },
  { label: "Welding", icon: "🔩" },
  { label: "Tiling", icon: "🪟" },
  { label: "Landscaping", icon: "🌿" },
];

const LOCATIONS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Naivasha",
  "Nyeri",
  "Malindi",
  "Nanyuki",
  "Kikuyu",
  "Machakos",
  "Kiambu",
  "Ruiru",
  "Athi River",
  "Kitale",
  "Lamu",
  "Garissa",
  "Meru",
  "Embu",
];

interface SearchBarProps {
  initialService?: string;
  initialLocation?: string;
}

export default function SearchBar({
  initialService = "",
  initialLocation = "",
}: SearchBarProps) {
  const router = useRouter();
  const [service, setService] = useState(initialService);
  const [location, setLocation] = useState(initialLocation);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(-1);
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1);

  const serviceRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Filter services based on typed input
  const filteredServices = SERVICES.filter((s) =>
    s.label.toLowerCase().includes(service.toLowerCase())
  );

  // Filter locations based on typed input
  const filteredLocations = LOCATIONS.filter((l) =>
    l.toLowerCase().includes(location.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
        setShowServiceDropdown(false);
        setActiveServiceIndex(-1);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
        setActiveLocationIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (service.trim()) params.append("service", service.trim());
    if (location.trim()) params.append("location", location.trim());

    router.push(`/search?${params.toString()}`);
  };

  const handleServiceKeyDown = (e: React.KeyboardEvent) => {
    if (!showServiceDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveServiceIndex((prev) =>
        prev < filteredServices.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveServiceIndex((prev) =>
        prev > 0 ? prev - 1 : filteredServices.length - 1
      );
    } else if (e.key === "Enter" && activeServiceIndex >= 0) {
      e.preventDefault();
      setService(filteredServices[activeServiceIndex].label);
      setShowServiceDropdown(false);
      setActiveServiceIndex(-1);
      locationInputRef.current?.focus();
    } else if (e.key === "Escape") {
      setShowServiceDropdown(false);
      setActiveServiceIndex(-1);
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (!showLocationDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveLocationIndex((prev) =>
        prev < filteredLocations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveLocationIndex((prev) =>
        prev > 0 ? prev - 1 : filteredLocations.length - 1
      );
    } else if (e.key === "Enter" && activeLocationIndex >= 0) {
      e.preventDefault();
      setLocation(filteredLocations[activeLocationIndex]);
      setShowLocationDropdown(false);
      setActiveLocationIndex(-1);
    } else if (e.key === "Escape") {
      setShowLocationDropdown(false);
      setActiveLocationIndex(-1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-10 relative z-20">
      {/* Main Search Bar */}
      <form
        onSubmit={handleSearch}
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl"
        style={{
          boxShadow:
            "0 25px 60px -12px rgba(0,0,0,0.35), 0 0 40px rgba(249,115,22,0.08)",
        }}
      >
        {/* Service Input */}
        <div ref={serviceRef} className="flex-1 relative">
          <div className="flex items-center bg-white rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-400/50">
            <svg
              className="w-5 h-5 text-primary-500 mr-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={serviceInputRef}
              type="text"
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                setShowServiceDropdown(true);
                setActiveServiceIndex(-1);
              }}
              onFocus={() => setShowServiceDropdown(true)}
              onKeyDown={handleServiceKeyDown}
              placeholder="What service do you need?"
              className="w-full bg-transparent border-none outline-none text-neutral-800 placeholder-neutral-400 text-base"
              autoComplete="off"
              id="hero-search-service"
            />
            {service && (
              <button
                type="button"
                onClick={() => {
                  setService("");
                  serviceInputRef.current?.focus();
                }}
                className="ml-2 text-neutral-300 hover:text-neutral-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Service Dropdown */}
          {showServiceDropdown && filteredServices.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-50 animate-fade-in"
              style={{ animationDuration: "150ms" }}
            >
              <div className="py-1 max-h-64 overflow-y-auto">
                {filteredServices.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setService(s.label);
                      setShowServiceDropdown(false);
                      setActiveServiceIndex(-1);
                      locationInputRef.current?.focus();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 ${
                      i === activeServiceIndex
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-xl w-7 text-center">{s.icon}</span>
                    <span className="font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:flex items-center">
          <div className="w-px h-8 bg-white/20"></div>
        </div>

        {/* Location Input */}
        <div ref={locationRef} className="flex-1 relative">
          <div className="flex items-center bg-white rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-400/50">
            <svg
              className="w-5 h-5 text-accent-500 mr-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationDropdown(true);
                setActiveLocationIndex(-1);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              onKeyDown={handleLocationKeyDown}
              placeholder="Location (e.g. Nairobi)"
              className="w-full bg-transparent border-none outline-none text-neutral-800 placeholder-neutral-400 text-base"
              autoComplete="off"
              id="hero-search-location"
            />
            {location && (
              <button
                type="button"
                onClick={() => {
                  setLocation("");
                  locationInputRef.current?.focus();
                }}
                className="ml-2 text-neutral-300 hover:text-neutral-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Location Dropdown */}
          {showLocationDropdown && filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-50 animate-fade-in"
              style={{ animationDuration: "150ms" }}
            >
              <div className="py-1 max-h-64 overflow-y-auto">
                {filteredLocations.map((loc, i) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      setShowLocationDropdown(false);
                      setActiveLocationIndex(-1);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 ${
                      i === activeLocationIndex
                        ? "bg-accent-50 text-accent-700"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 shrink-0 ${
                        i === activeLocationIndex ? "text-accent-500" : "text-neutral-300"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <span className="font-medium">{loc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          id="hero-search-button"
          className="btn-primary py-3.5 !px-8 sm:w-auto w-full flex items-center justify-center gap-2 text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>Search</span>
        </button>
      </form>

      {/* Popular Services Chips */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-white/50 text-sm mr-1">Popular:</span>
        {SERVICES.slice(0, 5).map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setService(s.label);
              setShowServiceDropdown(false);
              locationInputRef.current?.focus();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 backdrop-blur-sm cursor-pointer"
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
