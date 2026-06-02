"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2">
      <span className="text-sm text-gray-500">Someone is typing</span>
      <span className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  );
}
