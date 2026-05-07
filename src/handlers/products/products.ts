import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";

export const inviteComposer = new Composer()
  .extend(composer)
  .callbackQuery("products", async (context) => {
    return await ProductsCallback(context);
  })
  .callbackQuery(/copy_invite_(.+)/, async (context) => {
    return await CopyInviteCallback(context);
  })
  .callbackQuery("view_referrals", async (context) => {
    return await ViewReferralsCallBack(context);
  });
