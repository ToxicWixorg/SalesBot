import { InlineKeyboard } from "gramio";

export function newRefKeyboard(referrer: string, newUser: string) {
  return new InlineKeyboard()
    .url("👤 Inviter", `https://t.me/${referrer}`)
    .url("🆕 New user", `https://t.me/${newUser}`);
}
