import { Composer } from "gramio";
import { composer } from "../../plugins/index.ts";
import { ProductsCallback } from "./callbacks/ProductsCallback.ts";

export const inviteComposer = new Composer()
  .extend(composer)
  .callbackQuery("products", async (context) => {
    return await ProductsCallback(context);
  })

  });
