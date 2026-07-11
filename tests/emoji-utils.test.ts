import { expect, test } from "bun:test";
import { extractCustomEmojiIds } from "../src/shared/utils/customEmoji.ts";

test("extracts custom emoji ids from entities and inline markup", () => {
  expect(
    extractCustomEmojiIds({
      entities: [{ type: "custom_emoji", custom_emoji_id: "123456" }],
    }),
  ).toEqual(["123456"]);

  expect(
    extractCustomEmojiIds({
      text: '<tg-emoji emoji-id="789012">x</tg-emoji>',
    }),
  ).toEqual(["789012"]);
});
