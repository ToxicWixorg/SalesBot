import type { LanguageMap } from "@gramio/i18n";
import { bold, format } from "gramio";

export const en = {
	greeting: (name: string) => format`Hello, ${bold(name)}!`,
} satisfies LanguageMap;
