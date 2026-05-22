'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  rating: number;
  review?: string;
  clientName: string;
  createdAt: string;
}

interface ReviewData {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
  distribution: Record<number, number>;
  currentPage: number;
  totalPages: number;
}

interface ReviewSectionProps {
  fundiId: string;
  fundiName: string;
}

export default function ReviewSection({ fundiId, fundiName }: ReviewSectionProps) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [fundiId, sortBy, filterRating, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy, filterRating: filterRating.toString(), page: page.toString(), limit: '5',
      });
      const res = await fetch(`/api/ratings/${fundiId}?${params}`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`${size} ${s <= rating ? 'text-amber-400' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const getTimeAgo = (dateStr: string) => {
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['from-primary-400 to-primary-600','from-emerald-400 to-emerald-600','from-blue-400 to-blue-600','from-purple-400 to-purple-600','from-rose-400 to-rose-600'];
  const getColor = (name: string) => colors[name.charCodeAt(0) % colors.length];

  if (loading && !data) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-100 rounded-lg w-48" />
          <div className="h-24 bg-neutral-100 rounded-2xl" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { averageRating = 0, distribution = {}, totalCount = 0 } = data || {};

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100">
      <h3 className="text-2xl font-heading font-bold text-secondary-500 mb-6 flex items-center gap-3">
        <span className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-xl">⭐</span>
        Reviews & Ratings
      </h3>

      {totalCount === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl opacity-30">💬</span>
          </div>
          <h4 className="text-lg font-heading font-bold text-neutral-400 mb-2">No reviews yet</h4>
          <p className="text-neutral-400 text-sm max-w-sm mx-auto">
            Be the first to share your experience with {fundiName}.
          </p>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-2xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center flex-shrink-0">
                <div className="text-5xl font-heading font-black text-secondary-900 mb-1">{averageRating.toFixed(1)}</div>
                {renderStars(Math.round(averageRating), 'w-5 h-5')}
                <p className="text-xs text-neutral-400 mt-1 font-bold uppercase tracking-wider">{totalCount} Review{totalCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 w-full space-y-2">
                {[5,4,3,2,1].map(star => {
                  const count = (distribution as any)[star] || 0;
                  const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                  return (
                    <button key={star} onClick={() => { setFilterRating(filterRating === star ? 0 : star); setPage(1); }}
                      className={`flex items-center gap-3 w-full rounded-lg px-2 py-0.5 transition-all ${filterRating === star ? 'bg-primary-100/50' : 'hover:bg-neutral-100/50'}`}>
                      <span className="text-xs font-bold text-neutral-500 w-3">{star}</span>
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-neutral-400 w-6 text-right">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              {filterRating > 0 && (
                <button onClick={() => { setFilterRating(0); setPage(1); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-200 transition-colors">
                  {filterRating} Star{filterRating > 1 ? 's' : ''} ✕
                </button>
              )}
            </div>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="text-xs font-bold text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-300">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {data?.reviews && data.reviews.length > 0 ? data.reviews.map(review => (
              <div key={review._id} className="p-5 bg-neutral-50/50 rounded-2xl border border-neutral-100/80 hover:border-neutral-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(review.clientName)} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                    {getInitials(review.clientName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-secondary-900 text-sm">{review.clientName}</span>
                      <span className="text-[10px] text-neutral-400 font-medium flex-shrink-0">{getTimeAgo(review.createdAt)}</span>
                    </div>
                    <div className="mb-2">{renderStars(review.rating, 'w-3.5 h-3.5')}</div>
                    {review.review && <p className="text-neutral-600 text-sm leading-relaxed">{review.review}</p>}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-neutral-400 text-sm">No reviews match your filters.</p>
                <button onClick={() => { setFilterRating(0); setPage(1); }} className="text-primary-600 text-sm font-bold mt-2 hover:underline">Clear filters</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-all">Previous</button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${p === page ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-neutral-500 hover:bg-neutral-100'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-all">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
