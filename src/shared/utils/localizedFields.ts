type LocalizedNameEntity = {
  nameFA?: string | null;
  nameEN?: string | null;
  nameRU?: string | null;
  slug?: string | null;
};

type LocalizedDescriptionEntity = {
  descriptionFA?: string | null;
  descriptionEN?: string | null;
  descriptionRU?: string | null;
};

export type SupportedLanguage = "fa" | "en" | "ru";

export function normalizeLanguageCode(
  languageCode?: string | null,
): SupportedLanguage {
  const normalized = languageCode?.toLowerCase().split("-")[0];

  if (normalized === "fa" || normalized === "ru") return normalized;
  return "en";
}

function firstNonEmpty(values: Array<string | null | undefined>): string {
  return (
    values.find((value) => typeof value === "string" && value.trim()) ?? ""
  );
}

export function getLocalizedName(
  entity: LocalizedNameEntity,
  languageCode?: string | null,
): string {
  const language = normalizeLanguageCode(languageCode);

  if (language === "fa") {
    return firstNonEmpty([
      entity.nameFA,
      entity.nameEN,
      entity.nameRU,
      entity.slug,
    ]);
  }

  if (language === "ru") {
    return firstNonEmpty([
      entity.nameRU,
      entity.nameEN,
      entity.nameFA,
      entity.slug,
    ]);
  }

  return firstNonEmpty([
    entity.nameEN,
    entity.nameFA,
    entity.nameRU,
    entity.slug,
  ]);
}

export function getLocalizedDescription(
  entity: LocalizedDescriptionEntity,
  languageCode?: string | null,
): string {
  const language = normalizeLanguageCode(languageCode);

  if (language === "fa") {
    return firstNonEmpty([
      entity.descriptionFA,
      entity.descriptionEN,
      entity.descriptionRU,
    ]);
  }

  if (language === "ru") {
    return firstNonEmpty([
      entity.descriptionRU,
      entity.descriptionEN,
      entity.descriptionFA,
    ]);
  }

  return firstNonEmpty([
    entity.descriptionEN,
    entity.descriptionFA,
    entity.descriptionRU,
  ]);
}
