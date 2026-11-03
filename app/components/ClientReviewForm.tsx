"use client";

import { useEffect, useState } from "react";

interface ClientReviewFormProps {
  bookingId: string;
  fundiId: string;
  fundiName: string;
}

interface SavedReview {
  rating: number;
  review: string;
}

export default function ClientReviewForm({ bookingId, fundiId, fundiName }: ClientReviewFormProps) {
  const [savedReview, setSavedReview] = useState<SavedReview | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const fetchReview = async () => {
      try {
        const response = await fetch(`/api/ratings?bookingId=${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load your review");
        if (!active) return;
        if (result.review) {
          setSavedReview({ rating: result.review.rating, review: result.review.review || "" });
          setRating(result.review.rating);
          setReview(result.review.review || "");
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load your review");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchReview();
    return () => { active = false; };
  }, [bookingId]);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (rating < 1 || rating > 5) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, fundiId, rating, review }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your review");
      setSavedReview({ rating, review: review.trim() });
      setEditing(false);
      setNotice("Thanks for sharing your experience.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mt-3 text-xs text-slate-500">Checking review status…</p>;
  }

  return (
    <div className="mt-3">
      {savedReview && !editing ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-amber-600" aria-label={`${savedReview.rating} out of 5 stars`}>
            {"★".repeat(savedReview.rating)}{"☆".repeat(5 - savedReview.rating)}
          </span>
          <span className="text-slate-600">Your review for {fundiName}</span>
          <button type="button" onClick={() => setEditing(true)} className="font-semibold text-orange-600 hover:text-orange-700">
            Edit
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setEditing(true); setNotice(""); }}
          className="rounded-lg border border-orange-200 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
        >
          Leave a review
        </button>
      )}

      {notice && <p role="status" className="mt-2 text-xs text-emerald-700">{notice}</p>}
      {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}

      {editing && (
        <form onSubmit={submitReview} className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">How was your experience with {fundiName}?</p>
          <div className="mt-2 flex gap-1" role="group" aria-label="Choose a rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                aria-pressed={rating === value}
                className={`text-2xl transition ${value <= rating ? "text-amber-500" : "text-slate-300"} hover:scale-110`}
              >
                ★
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor={`review-${bookingId}`}>
            Your review <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id={`review-${bookingId}`}
            value={review}
            onChange={(event) => setReview(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Share what went well or what could be improved."
            className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
          <p className="mt-1 text-right text-xs text-slate-500">{review.length}/500</p>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} disabled={saving} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || rating < 1} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Submitting…" : savedReview ? "Update review" : "Submit review"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
