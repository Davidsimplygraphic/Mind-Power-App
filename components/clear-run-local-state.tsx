"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ClearRunLocalStateProps = {
  resetSignal: string | null;
};

const runStoragePrefixes = [
  "mind-power-session-",
  "mind-power-exercise-timer-",
  "mind-power-exercise-checklist-",
];

function shouldClearRunKey(key: string) {
  return runStoragePrefixes.some((prefix) => key.startsWith(prefix));
}

export function ClearRunLocalState({ resetSignal }: ClearRunLocalStateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serializedSearchParams = searchParams.toString();

  useEffect(() => {
    if (resetSignal !== "challenge") {
      return;
    }

    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);

      if (key && shouldClearRunKey(key)) {
        window.localStorage.removeItem(key);
      }
    }

    const nextSearchParams = new URLSearchParams(serializedSearchParams);
    nextSearchParams.delete("local_reset");
    const nextPath = nextSearchParams.toString()
      ? `${pathname}?${nextSearchParams.toString()}`
      : pathname;

    router.replace(nextPath, { scroll: false });
  }, [pathname, resetSignal, router, serializedSearchParams]);

  return null;
}
