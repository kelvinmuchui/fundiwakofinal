"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MessagesWindow from "@/app/components/MessagesWindow";

type ConversationDetails = {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    photoURL?: string;
  };
};

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/messages/conversations/${encodeURIComponent(conversationId)}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Could not load this conversation.");
        }
        if (!cancelled) setConversation(result.conversation);
      } catch (loadError) {
        console.error("Error loading conversation:", loadError);
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load this conversation.");
        }
      }
    };

    void loadConversation();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600">Client conversation</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-secondary-500">
              {conversation?.otherUser.name || "Messages"}
            </h1>
          </div>
          <Link href="/messages" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            All messages
          </Link>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            <p>{error}</p>
            <Link href="/messages" className="mt-3 inline-block font-semibold underline">Back to messages</Link>
          </div>
        ) : conversation ? (
          <div className="h-[calc(100vh-11rem)] min-h-[500px]">
            <MessagesWindow
              conversationId={conversation._id}
              otherUserId={conversation.otherUser._id}
              otherUserName={conversation.otherUser.name}
              otherUserPhoto={conversation.otherUser.photoURL}
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading conversation">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
          </div>
        )}
      </div>
    </main>
  );
}
