import { Scene } from "@gramio/scenes";
import { UserRepository } from "../repositories/UserRepository.ts";
import { i18n } from "../shared/locales/index.ts";

function extractCustomEmojiIdsFromEntities(message: any): string[] {
  const entities = message.entities ?? [];
  return entities
    .filter((entity: any) => entity.type === "custom_emoji")
    .map((entity: any) => entity.custom_emoji_id ?? entity.customEmojiId)
    .filter((id: unknown): id is string => typeof id === "string");
}

function extractCustomEmojiIdsFromText(text: string): string[] {
  const ids: string[] = [];
  const regex = /emoji-id=["'](\d+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    ids.push(match[1]);
  }
  return ids;
}

export const enterCustomEmojiIdsScene = new Scene("enter-custom-emoji-ids").on(
  "message",
  async (context) => {
    if (!context.from) {
      return;
    }

    const userId = context.from.id;
    const user = await UserRepository.findById(userId);
    if (!user) {
      await context.send("❌ User not found.");
      return;
    }

    const t = i18n.buildT(user.languageCode || "fa");
    const message =
      (context.update as any).message ?? (context.update as any).edited_message;
    if (!message) {
      await context.send(t("adminpanelEmojiParserNoEmoji"), {
        parse_mode: "HTML",
      });
      await context.scene.exit();
      return;
    }

    const content = message.text ?? message.caption ?? "";

    let ids = extractCustomEmojiIdsFromEntities(message);
    if (ids.length === 0 && typeof content === "string") {
      ids = extractCustomEmojiIdsFromText(content);
    }

    await context.scene.exit();

    if (ids.length === 0) {
      return context.send(t("adminpanelEmojiParserNoEmoji"), {
        parse_mode: "HTML",
      });
    }

    const lines = ids.map((id) => `<code>${id}</code>`).join("\n");
    const result = t("adminpanelEmojiParserResult", { ids: lines });
    return context.send(result, { parse_mode: "HTML" });
  },
);
