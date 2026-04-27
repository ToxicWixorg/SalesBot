import { defineI18n } from "@gramio/i18n";
import { en } from "./en.ts";
import { ru } from "./ru.ts";

export const i18n = defineI18n({
	primaryLanguage: "en",
	languages: {
		en,
		ru,
	},
});

export type TFunction = ReturnType<typeof i18n.buildT>;
