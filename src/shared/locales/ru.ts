import type { ShouldFollowLanguageStrict } from "@gramio/i18n";
import { bold, format } from "gramio";
import type { en } from "./en.ts";

export const ru = {
	greeting: (name: string) => format`Привет, ${bold(name)}!`,
} satisfies ShouldFollowLanguageStrict<typeof en>;
