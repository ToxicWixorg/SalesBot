import { defineI18n } from "@gramio/i18n";
import { en } from "./en.ts";
import { ru } from "./ru.ts";
import { fa } from "./fa.ts";

export const i18n = defineI18n({
  primaryLanguage: "en",
  languages: {
    en,
    ru,
    fa,
  },
});

export type TFunction = ReturnType<typeof i18n.buildT>;
