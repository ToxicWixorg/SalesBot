/**
 * Example usage of centralized keyboards
 * این فایل نمونه‌های استفاده از کیبوردها را نشان می‌دهد
 */

import { Composer } from "gramio";
import {
  mainMenuKeyboard,
  backKeyboard,
  cancelKeyboard,
  backToMainKeyboard,
  confirmationKeyboard,
  confirmWithCancelKeyboard,
  settingsKeyboard,
  paginationKeyboard,
  listItemKeyboard,
} from "../shared/keyboards/index.ts";
import { i18n } from "../shared/locales/index.ts";

export const exampleComposer = new Composer();

// Example 1: Using main menu keyboard
exampleComposer.command("menu", async (context) => {
  const t = i18n.buildT("en"); // or get from user's language

  await context.send("Here's the main menu:", {
    reply_markup: mainMenuKeyboard(t),
  });
});

// Example 2: Using back button
exampleComposer.callbackQuery("some_action", async (context) => {
  const t = i18n.buildT("en");

  await context.send("Do you want to go back?", {
    reply_markup: backKeyboard(t, "go_back"),
  });
});

// Example 3: Using confirmation keyboard
exampleComposer.callbackQuery("delete_item", async (context) => {
  const t = i18n.buildT("en");

  await context.send("Are you sure you want to delete this item?", {
    reply_markup: confirmationKeyboard(
      t,
      "delete_confirmed",
      "delete_cancelled",
    ),
  });
});

// Example 4: Using pagination
exampleComposer.command("products", async (context) => {
  const t = i18n.buildT("en");
  const currentPage = 1;
  const totalPages = 10;

  await context.send(
    `Products (Page ${currentPage} of ${totalPages}):\n\n1. Product A\n2. Product B\n3. Product C`,
    {
      reply_markup: paginationKeyboard(
        t,
        currentPage,
        totalPages,
        "products_page",
      ),
    },
  );
});

// Example 5: Using list item keyboard
exampleComposer.command("product_detail", async (context) => {
  const t = i18n.buildT("en");
  const productId = 123;

  const actions = [
    { text: "👁️ View Details", callback: "view" },
    { text: "🛒 Add to Cart", callback: "add_cart" },
    { text: "❤️ Add to Favorites", callback: "favorite" },
  ];

  await context.send("Product Name: Premium Subscription\nPrice: $9.99/month", {
    reply_markup: listItemKeyboard(productId, actions),
  });
});

// Example 6: Using settings keyboard
exampleComposer.callbackQuery("settings", async (context) => {
  const t = i18n.buildT("en");

  await context.send("⚙️ Settings", {
    reply_markup: settingsKeyboard(t),
  });
});

// Example 7: Using confirm with cancel
exampleComposer.callbackQuery("checkout", async (context) => {
  const t = i18n.buildT("en");

  await context.send(
    "📦 Order Summary:\n\nTotal: $29.99\n\nPlease confirm your order:",
    {
      reply_markup: confirmWithCancelKeyboard(
        t,
        "order_confirmed",
        "order_cancelled",
      ),
    },
  );
});

// Example 8: Using back to main menu
exampleComposer.callbackQuery("help", async (context) => {
  const t = i18n.buildT("en");

  await context.send(
    "📖 Help Section\n\nIf you need assistance, contact @support",
    {
      reply_markup: backToMainKeyboard(t),
    },
  );
});
