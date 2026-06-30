import { CurrenciesType } from "../types/currencies";

export const getCurrencies = async (): Promise<CurrenciesType | null> => {
  const url = "https://api.tetherland.com/currencies";
  const options = { method: "GET", headers: { Accept: "application/json" } };

  try {
    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
      console.error(
        "[ERROR _getCurrencies_] bad status:",
        response.status,
        text,
      );
      return null;
    }

    let data: { status: number; data: { currencies: CurrenciesType } };
    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("[ERROR _getCurrencies_] invalid JSON response:", text);
      return null;
    }

    return data?.data?.currencies ?? null;
  } catch (error) {
    console.error("[ERROR _getCurrencies_] : ", error);
    return null;
  }
};
