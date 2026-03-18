"use client";

import { useState } from "react";

type SessionContentTabsProps = {
  audioContent: React.ReactNode;
  exercisesContent: React.ReactNode;
};

type SessionTab = "audio" | "exercises";

export function SessionContentTabs({
  audioContent,
  exercisesContent,
}: SessionContentTabsProps) {
  const [activeTab, setActiveTab] = useState<SessionTab>("audio");

  return (
    <section className="surface space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="eyebrow">Session Flow</p>
          <h2 className="text-2xl">Audio and workbook</h2>
        </div>
        <div className="surface-muted inline-flex p-1">
          <button
            aria-pressed={activeTab === "audio"}
            className={
              activeTab === "audio"
                ? "primary-button min-h-0 px-4 py-2 text-sm"
                : "secondary-button min-h-0 px-4 py-2 text-sm"
            }
            onClick={() => setActiveTab("audio")}
            type="button"
          >
            Audio
          </button>
          <button
            aria-pressed={activeTab === "exercises"}
            className={
              activeTab === "exercises"
                ? "primary-button ml-2 min-h-0 px-4 py-2 text-sm"
                : "secondary-button ml-2 min-h-0 px-4 py-2 text-sm"
            }
            onClick={() => setActiveTab("exercises")}
            type="button"
          >
            Exercises
          </button>
        </div>
      </div>

      {activeTab === "audio" ? audioContent : exercisesContent}
    </section>
  );
}
