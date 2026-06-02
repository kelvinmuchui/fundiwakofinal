"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface Skill {
  skillId?: string;
  name: string;
  yearsOfExperience?: number;
  endorsementCount: number;
  endorsedBy?: string[];
  isPrimary?: boolean;
}

interface SkillEndorsementProps {
  skill: Skill;
  targetUserId: string;
  isConnected?: boolean;
  onEndorsed?: () => void;
  hasEndorsed?: boolean;
}

export default function SkillEndorsement({
  skill,
  targetUserId,
  isConnected = false,
  onEndorsed,
  hasEndorsed = false
}: SkillEndorsementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEndorsed, setIsEndorsed] = useState(hasEndorsed);
  const [endorsementCount, setEndorsementCount] = useState(skill.endorsementCount || 0);

  const handleEndorse = async () => {
    if (!isConnected) {
      toast.error("You must be connected to endorse a skill");
      return;
    }

    if (isEndorsed) {
      toast.info("You have already endorsed this skill recently");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/skills/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          skillName: skill.name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to endorse skill");
        return;
      }

      setIsEndorsed(true);
      setEndorsementCount(endorsementCount + 1);
      toast.success("Skill endorsed!");
      onEndorsed?.();
    } catch (error) {
      console.error("Endorsement error:", error);
      toast.error("Failed to endorse skill");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{skill.name}</h4>
          {skill.isPrimary && (
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
              Primary
            </span>
          )}
        </div>
        {skill.yearsOfExperience && (
          <p className="text-sm text-gray-600">
            {skill.yearsOfExperience} years experience
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-center">
          <div className="font-bold text-lg text-gray-900">{endorsementCount}</div>
          <p className="text-xs text-gray-600">endorsements</p>
        </div>

        <button
          onClick={handleEndorse}
          disabled={isLoading || isEndorsed}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isEndorsed
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : isConnected
                ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-95"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Endorsing..." : isEndorsed ? "Endorsed" : "Endorse"}
        </button>
      </div>
    </div>
  );
}
