import { Scene } from "@gramio/scenes";
import { UserRepository } from "../repositories/UserRepository.ts";
import { DiscountCodeRepository } from "../repositories/DiscountCodeRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import {
  discountRetryKeyboard,
  discountValidBackKeyboard,
} from "../shared/keyboards/index.ts";

export const enterDiscountCodeScene = new Scene("enter-discount-code").on(
  "message",
  async (context) => {
    if (!context.from || !context.text) {
      return;
    }

    const userId = context.from.id;
    const user = await UserRepository.findById(userId);

    if (!user) {
      return context.send("❌ User not found.");
    }

    const t = i18n.buildT(user.languageCode || "fa");

    const code = context.text.trim().toUpperCase();

    const validation = await DiscountCodeRepository.validateCode(
      code,
      userId,
      100000,
    );

    await context.scene.exit();

    if (validation.valid && validation.discountCode) {
      const discountInfo = t("discountCodeValid", {
        code: code,
        type:
          validation.discountCode.type === "percentage"
            ? t("discountTypePercentage")
            : t("discountTypeFixed"),
        value: validation.discountCode.value,
        description: validation.discountCode.description || t("noDescription"),
      });

      return context.send(discountInfo, {
        reply_markup: discountValidBackKeyboard(t),
        parse_mode: "HTML",
      });
    } else {
      return context.send(t("discountCodeInvalid", validation.message), {
        reply_markup: discountRetryKeyboard(t),
        parse_mode: "HTML",
      });
    }
  },
);
