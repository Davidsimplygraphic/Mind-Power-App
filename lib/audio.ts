export function normalizeAudioPath(audioPath: string | null | undefined) {
  const trimmedAudioPath = audioPath?.trim() ?? "";

  return trimmedAudioPath ? trimmedAudioPath : null;
}

export function getAudioTitleFromPath(audioPath: string | null | undefined) {
  const normalizedAudioPath = normalizeAudioPath(audioPath);

  if (!normalizedAudioPath) {
    return null;
  }

  const filename = normalizedAudioPath.split("/").pop() ?? normalizedAudioPath;

  return filename.replace(/\.[^.]+$/, "");
}

export function isWmaAudioPath(audioPath: string | null | undefined) {
  const normalizedAudioPath = normalizeAudioPath(audioPath);

  return normalizedAudioPath?.toLowerCase().endsWith(".wma") ?? false;
}
