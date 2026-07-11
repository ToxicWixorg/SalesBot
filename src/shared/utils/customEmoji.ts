export function normalizeCustomEmojiId(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return undefined;
  }
  return trimmed;
}

export function extractCustomEmojiIds(message: {
  entities?: Array<{
    type?: string;
    custom_emoji_id?: string | null;
    customEmojiId?: string | null;
  }>;
  text?: string | null;
  caption?: string | null;
}): string[] {
  const entities = message.entities ?? [];
  const ids = entities
    .filter((entity) => entity.type === "custom_emoji")
    .map((entity) => entity.custom_emoji_id ?? entity.customEmojiId)
    .filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0,
    );

  if (ids.length > 0) {
    return ids;
  }

  const content = `${message.text ?? ""} ${message.caption ?? ""}`;
  const regex = /emoji-id=["'](\d+)["']/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content))) {
    matches.push(match[1]);
  }
  return matches;
}
