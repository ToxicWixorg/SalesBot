import { type InfoStep } from "../../../handlers/products/pendingOrderInfoState";

export function getPromptKey(step: InfoStep): string {
  const map: Record<InfoStep, string> = {
    email: "manualOrderEmailPrompt",
    password: "manualOrderPasswordPrompt",
    loginUsername: "manualOrderLoginUsernamePrompt",
    loginPassword: "manualOrderLoginPasswordPrompt",
    region: "manualOrderRegionPrompt",
  };
  return map[step];
}
