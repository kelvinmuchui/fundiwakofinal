interface TestimonialCardProps {
    name: string;
    location: string;
    rating: number;
    review: string;
    service: string;
    initials: string;
}

export default function TestimonialCard({
    name,
    location,
    rating,
    review,
    service,
    initials,
}: TestimonialCardProps) {
    return (
        <div className="group bg-white rounded-2xl p-6 card-hover border border-neutral-100 relative overflow-hidden">
            {/* Quote icon */}
            <div className="absolute top-4 right-4 text-primary-100 group-hover:text-primary-200 transition-colors duration-300">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                </svg>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${i < rating ? "text-amber-400" : "text-neutral-200"
                            }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            {/* Review */}
            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                &ldquo;{review}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-heading font-bold text-sm shadow-md">
                    {initials}
                </div>
                <div>
                    <p className="font-heading font-semibold text-secondary-500 text-sm">
                        {name}
                    </p>
                    <p className="text-xs text-neutral-400">
                        {location} · {service}
                    </p>
                </div>
            </div>
        </div>
    );
}
