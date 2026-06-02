"use client";

import { useState } from "react";
import { toast } from "react-toastify";

type ConnectionStatus = "not_connected" | "pending" | "connected" | "blocked";

interface ConnectionButtonProps {
  targetUserId: string;
  status?: ConnectionStatus;
  onStatusChange?: (newStatus: ConnectionStatus) => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function ConnectionButton({
  targetUserId,
  status = "not_connected",
  onStatusChange,
  size = "md",
  fullWidth = false
}: ConnectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ConnectionStatus>(status);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const handleConnect = async () => {
    if (currentStatus === "connected" || currentStatus === "pending") return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          relationship: "colleague"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to send connection request");
        return;
      }

      setCurrentStatus("pending");
      toast.success("Connection request sent!");
      onStatusChange?.("pending");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to send connection request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!confirm("Are you sure you want to remove this connection?")) return;

    setIsLoading(true);
    try {
      // TODO: Implement remove connection endpoint
      toast.info("Feature coming soon");
    } catch (error) {
      console.error("Remove connection error:", error);
      toast.error("Failed to remove connection");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (currentStatus) {
      case "connected":
        return (
          <>
            <span>✓ Connected</span>
            <button
              onClick={handleRemoveConnection}
              className="ml-2 text-xs opacity-60 hover:opacity-100"
            >
              Remove
            </button>
          </>
        );
      case "pending":
        return "Pending...";
      case "blocked":
        return "Blocked";
      default:
        return "Connect";
    }
  };

  const getButtonClasses = () => {
    const baseClasses = `${sizeClasses[size]} rounded-lg font-medium transition-all ${fullWidth ? "w-full" : ""}`;

    switch (currentStatus) {
      case "connected":
        return `${baseClasses} bg-blue-100 text-blue-600 hover:bg-blue-200`;
      case "pending":
        return `${baseClasses} bg-gray-100 text-gray-600 cursor-not-allowed`;
      case "blocked":
        return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed`;
      default:
        return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 active:scale-95`;
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading || currentStatus !== "not_connected"}
      className={getButtonClasses()}
    >
      {isLoading ? "Processing..." : getButtonContent()}
    </button>
  );
}
