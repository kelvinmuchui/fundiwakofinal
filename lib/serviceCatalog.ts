export type ServiceCatalogItem = {
  title: string;
  description: string;
  color: string;
  iconName: string;
};

export const FUNDI_SERVICE_CATALOG: ServiceCatalogItem[] = [
  { title: "Plumbing", description: "Fix leaks, install pipes, water heaters and bathroom fittings.", color: "gradient-primary", iconName: "plumbing" },
  { title: "Electrical", description: "Wiring, lighting installations, fault finding and repairs.", color: "gradient-secondary", iconName: "electrical" },
  { title: "Carpentry", description: "Custom furniture, cabinets, doors, roofing and wood repairs.", color: "gradient-accent", iconName: "carpentry" },
  { title: "Painting", description: "Interior and exterior painting, wallpapering and finishing.", color: "bg-fuchsia-500", iconName: "painting" },
  { title: "Masonry", description: "Bricklaying, plastering, concrete work and stonework.", color: "bg-blue-600", iconName: "masonry" },
  { title: "Cleaning", description: "Home, office, upholstery and post-construction cleaning.", color: "bg-emerald-500", iconName: "cleaning" },
  { title: "Roofing", description: "Roof installation, repairs, waterproofing and gutter work.", color: "bg-amber-600", iconName: "roofing" },
  { title: "Welding & Metalwork", description: "Metal fabrication, gates, grills and structural welding.", color: "bg-slate-700", iconName: "welding" },
  { title: "Tiling & Flooring", description: "Tile installation, floor finishes, repairs and grouting.", color: "bg-cyan-600", iconName: "flooring" },
  { title: "Landscaping & Gardening", description: "Garden design, lawn care, planting and outdoor maintenance.", color: "bg-lime-600", iconName: "landscaping" },
  { title: "ICT & Computer Repair", description: "Computer repair, IT support, networking and software setup.", color: "bg-sky-700", iconName: "ict" },
  { title: "Barista & Hospitality", description: "Barista services, catering support and hospitality staffing.", color: "bg-rose-700", iconName: "hospitality" },
  { title: "Fashion & Design", description: "Tailoring, garment alterations, fashion and textile design.", color: "bg-pink-600", iconName: "fashion" },
  { title: "Animal Health & Veterinary", description: "Qualified animal care, livestock health and veterinary support.", color: "bg-teal-700", iconName: "animal-health" },
  { title: "Solar Installation", description: "Solar panels, inverters, batteries and system maintenance.", color: "bg-yellow-600", iconName: "solar" },
  { title: "Automotive Mechanics", description: "Vehicle diagnostics, servicing and mechanical repairs.", color: "bg-red-700", iconName: "automotive" },
  { title: "Beauty & Hair", description: "Hair styling, barbering, beauty and makeup services.", color: "bg-violet-700", iconName: "beauty" },
  { title: "Appliance Repair", description: "Repair and maintenance for home and commercial appliances.", color: "bg-indigo-700", iconName: "appliance" },
  { title: "Pest Control", description: "Residential and commercial pest inspection and treatment.", color: "bg-orange-700", iconName: "pest-control" },
  { title: "HVAC & Refrigeration", description: "Air conditioning, ventilation and refrigeration installation and repair.", color: "bg-blue-800", iconName: "hvac" },
];