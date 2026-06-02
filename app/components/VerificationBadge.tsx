"use client";

import { useState } from "react";
import Image from "next/image";

interface VerificationBadgeProps {
  type: "email_verified" | "id_verified" | "background_checked" | "certified" | "phone_verified";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function VerificationBadge({ type, label, size = "md" }: VerificationBadgeProps) {
  const badgeConfig = {
    email_verified: {
      icon: "✓",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      label: "Email Verified",
      title: "Email address verified"
    },
    id_verified: {
      icon: "🆔",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      label: "ID Verified",
      title: "Identity verified"
    },
    background_checked: {
      icon: "✓",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      label: "Background Checked",
      title: "Background check passed"
    },
    certified: {
      icon: "★",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      label: "Certified",
      title: "Professional certified"
    },
    phone_verified: {
      icon: "📱",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      label: "Phone Verified",
      title: "Phone verified"
    }
  };

  const config = badgeConfig[type];
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  };

  return (
    <div
      className={`${config.bgColor} ${config.textColor} ${sizeClasses[size]} rounded-full flex items-center justify-center font-bold cursor-help`}
      title={config.title}
    >
      {config.icon}
      {size === "lg" && label && (
        <span className="ml-2 text-xs font-semibold">{label || config.label}</span>
      )}
    </div>
  );
}
