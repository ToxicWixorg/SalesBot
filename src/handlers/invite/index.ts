import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";

import { InviteCallback } from "./callbacks/Invite.ts";
import { CopyInviteCallback } from "./callbacks/CopyInvite.ts";
import { ViewReferralsCallBack } from "./callbacks/ViewReferrals.ts";

export const inviteComposer = new Composer()
  .extend(composer)
  .callbackQuery("invite", async (context) => {
    return await InviteCallback(context);
  })
  .callbackQuery(/copy_invite_(.+)/, async (context) => {
    return await CopyInviteCallback(context);
  })
  .callbackQuery("view_referrals", async (context) => {
    return await ViewReferralsCallBack(context);
  });
