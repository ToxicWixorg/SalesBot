import { Bot, AnyBot, InlineKeyboard } from "gramio";
import { UserRepository } from "../repositories/UserRepository.ts";
import { WalletRepository } from "../repositories/WalletRepository.ts";
import { i18n } from "../shared/locales/index.ts";
import { ticketState, ticketReplyState } from "./support-tickets.ts";

/**
 * Scene برای شارژ کیف پول
 *
 * این scene جریان کامل شارژ کیف پول را مدیریت می‌کند:
 * 1. انتخاب روش پرداخت (کریپتو / کارت / زرین پال)
 * 2. ورود مبلغ
 * 3. تکمیل پرداخت
 * 4. به‌روزرسانی موجودی
 */

// State management برای ذخیره وضعیت کاربران در حین شارژ
const rechargeState = new Map<
  number,
  {
    method: "crypto" | "card" | "zarinpal";
    amount?: number;
    step: "amount" | "txid" | "payment";
  }
>();

export function setupWalletRechargeScene(bot: AnyBot) {
  /**
   * ورود به scene شارژ - انتخاب مبلغ
   */
  bot.callbackQuery(/^recharge_(crypto|card|zarinpal)$/, async (context) => {
    const method = context.queryData[1] as "crypto" | "card" | "zarinpal";

    // ذخیره state
    rechargeState.set(context.from.id, {
      method,
      step: "amount",
    });

    const user = await UserRepository.findById(context.from.id);
    const t = i18n.buildT(user?.languageCode || "en");

    const keyboard = new InlineKeyboard().text(
      t("btnCancel"),
      "wallet_recharge_cancel",
    );

    let minAmount = "10";
    let maxAmount = "10000";
    let enterAmountText = t("rechargeEnterAmount");
    let minAmountText = "rechargeMinAmount";
    let maxAmountText = "rechargeMaxAmount";

    // برای USDT مقدار به USDT باشد
    if (method === "crypto") {
      minAmount = "10";
      maxAmount = "10000";
      enterAmountText = t("rechargeEnterAmountUsdt");
      minAmountText = "rechargeMinAmountUsdt";
      maxAmountText = "rechargeMaxAmountUsdt";
    } else {
      // برای کارت و زرین‌پال به تومان
      minAmount = "10000";
      maxAmount = "1000000";
    }

    const title =
      method === "crypto"
        ? t("rechargeCryptoTitle")
        : method === "card"
          ? t("rechargeCardTitle")
          : t("rechargeZarinpalTitle");

    await context.editText(
      `${title}\n\n${enterAmountText}\n\n${t(minAmountText as any, minAmount)}\n${t(maxAmountText as any, maxAmount)}`,
      { reply_markup: keyboard, parse_mode: "HTML" },
    );

    await context.answerCallbackQuery();
  });

  bot.on("message", async (context) => {
    console.log("[DEBUG-WALLET] Message handler (amount) triggered");
    const userId = context.from?.id;
    if (!userId) return;

    // Check if user is in a scene - skip if so
    const inScene = (context as any).scene?.current;
    if (inScene) {
      console.log("[DEBUG-WALLET] User is in scene, skipping");
      return;
    }

    // Check if user is creating/replying to a ticket - skip if so
    if (ticketState.has(userId) || ticketReplyState.has(userId)) {
      console.log("[DEBUG-WALLET] User is in ticket state, skipping");
      return;
    }

    const state = rechargeState.get(userId);
    if (!state || state.step !== "amount") {
      console.log("[DEBUG-WALLET] No recharge state (amount), skipping");
      return;
    }

    const text = context.text;
    if (!text) return;

    // Parse مبلغ
    const amount = parseFloat(text.replace(/[^0-9.]/g, ""));

    if (isNaN(amount) || amount <= 0) {
      const user = await UserRepository.findById(userId);
      const t = i18n.buildT(user?.languageCode || "en");
      await context.reply(t("rechargeInvalidAmount"), { parse_mode: "HTML" });
      return;
    }

    // بررسی محدوده
    let minAmount = 10;
    let maxAmount = 10000;

    // برای USDT
    if (state.method === "crypto") {
      minAmount = 10;
      maxAmount = 10000;
    } else {
      // برای کارت و زرین‌پال (تومان)
      minAmount = 10000;
      maxAmount = 1000000;
    }

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "en");

    if (amount < minAmount) {
      await context.reply(t("rechargeTooLow" as any, minAmount.toString()), {
        parse_mode: "HTML",
      });
      return;
    }

    if (amount > maxAmount) {
      await context.reply(t("rechargeTooHigh" as any, maxAmount.toString()), {
        parse_mode: "HTML",
      });
      return;
    }

    // ذخیره مبلغ
    state.amount = amount;

    // بر اساس روش پرداخت، مرحله بعد را تعیین کن
    if (state.method === "crypto") {
      await handleCryptoPayment(context, amount);
      state.step = "txid";
    } else if (state.method === "zarinpal") {
      await handleZarinpalPayment(context, amount);
      state.step = "payment";
    } else {
      await handleCardPayment(context, amount);
      state.step = "payment";
    }

    rechargeState.set(userId, state);
  });

  /**
   * دریافت TxID برای پرداخت کریپتو
   */
  bot.on("message", async (context) => {
    console.log("[DEBUG-WALLET] Message handler (txid) triggered");
    const userId = context.from?.id;
    if (!userId) return;

    // Check if user is in a scene - skip if so
    const inScene = (context as any).scene?.current;
    if (inScene) {
      console.log("[DEBUG-WALLET] User is in scene, skipping");
      return;
    }

    // Check if user is creating/replying to a ticket - skip if so
    if (ticketState.has(userId) || ticketReplyState.has(userId)) {
      console.log("[DEBUG-WALLET] User is in ticket state, skipping");
      return;
    }

    const state = rechargeState.get(userId);
    if (!state || state.step !== "txid" || state.method !== "crypto") {
      console.log("[DEBUG-WALLET] No recharge state (txid), skipping");
      return;
    }

    const txId = context.text;
    if (!txId || txId.length < 10) {
      await context.reply("❌ TxID نامعتبر است. لطفاً دوباره تلاش کنید.");
      return;
    }

    // ذخیره TxID و ارسال پیام تأیید
    const userForReply = await UserRepository.findById(userId);
    const tReply = i18n.buildT(userForReply?.languageCode || "en");
    await context.reply(tReply("rechargeCryptoTxIdReceived" as any), {
      parse_mode: "HTML",
    });

    // TODO: بررسی TxID در blockchain
    // در اینجا باید API blockchain را برای تأیید تراکنش فراخوانی کنید

    // فعلاً فرض می‌کنیم که پرداخت تأیید شده است (باید با API واقعی جایگزین شود)
    await processCryptoPayment(userId, state.amount || 0, txId);

    // پاک کردن state
    rechargeState.delete(userId);

    const keyboard = new InlineKeyboard().text(tReply("btnWallet"), "wallet");

    await context.reply(
      tReply("rechargeCryptoVerified" as any, (state.amount || 0).toString()),
      { reply_markup: keyboard, parse_mode: "HTML" },
    );
  });

  /**
   * لغو شارژ
   */
  bot.callbackQuery("wallet_recharge_cancel", async (context) => {
    const userId = context.from.id;
    rechargeState.delete(userId);

    const user = await UserRepository.findById(userId);
    const t = i18n.buildT(user?.languageCode || "en");

    const keyboard = new InlineKeyboard()
      .text(t("btnRechargeCrypto"), "recharge_crypto")
      .row()
      .text(t("btnRechargeCard"), "recharge_card")
      .row()
      .text(t("btnRechargeZarinpal"), "recharge_zarinpal")
      .row()
      .text(t("btnBack"), "wallet");

    await context.editText(
      `${t("rechargeWalletTitle")}\n\n${t("rechargeSelectMethod")}`,
      { reply_markup: keyboard, parse_mode: "HTML" },
    );

    await context.answerCallbackQuery({
      text: t("rechargePaymentCancelled"),
    });
  });
}

/**
 * پردازش پرداخت کریپتو
 */
async function handleCryptoPayment(context: any, amount: number) {
  const userId = context.from?.id;
  const user = userId ? await UserRepository.findById(userId) : undefined;
  const t = i18n.buildT(user?.languageCode || "en");

  // TODO: اینجا باید آدرس کیف پول کریپتو و اطلاعات پرداخت را از کانفیگ یا دیتابیس بگیریم
  const cryptoAddress = "TYourCryptoWalletAddressHere123456789";
  const network = "TRC20";
  const usdtAmount = (amount / 55000).toFixed(2); // فرضی: نرخ تبدیل تومان به USDT

  const keyboard = new InlineKeyboard().text(
    t("btnCancel"),
    "wallet_recharge_cancel",
  );

  await context.reply(
    `${t("rechargeCryptoTitle")}\n\n${t("rechargeCryptoAddress" as any, cryptoAddress)}\n\n${t("rechargeCryptoAmount" as any, usdtAmount)}\n${t("rechargeCryptoNetwork" as any, network)}\n\n${t("rechargeCryptoInstructions" as any)}\n\n${t("rechargeCryptoSendTxId" as any)}`,
    { reply_markup: keyboard, parse_mode: "HTML" },
  );
}

/**
 * پردازش پرداخت با زرین پال
 */
async function handleZarinpalPayment(context: any, amount: number) {
  const userId = context.from?.id;
  const user = userId ? await UserRepository.findById(userId) : undefined;
  const t = i18n.buildT(user?.languageCode || "en");

  // TODO: اینجا باید درگاه زرین پال را فراخوانی کنید و لینک پرداخت را دریافت کنید
  const paymentUrl = `https://www.zarinpal.com/pg/StartPay/A1B2C3D4E5F6`; // فرضی

  const keyboard = new InlineKeyboard()
    .url(t("btnPayNow"), paymentUrl)
    .row()
    .text(t("btnCancel"), "wallet_recharge_cancel");

  await context.reply(
    `${t("rechargeZarinpalTitle")}\n\n${t("rechargePaymentLink" as any, amount.toString())}`,
    { reply_markup: keyboard, parse_mode: "HTML" },
  );

  await context.reply(t("rechargePaymentPending" as any), {
    parse_mode: "HTML",
  });
}

/**
 * پردازش پرداخت با کارت
 */
async function handleCardPayment(context: any, amount: number) {
  const userId = context.from?.id;
  const user = userId ? await UserRepository.findById(userId) : undefined;
  const t = i18n.buildT(user?.languageCode || "en");

  // TODO: اینجا باید درگاه پرداخت کارت را فراخوانی کنید
  const paymentUrl = `https://payment-gateway.example.com/pay/123456`; // فرضی

  const keyboard = new InlineKeyboard()
    .url(t("btnPayNow"), paymentUrl)
    .row()
    .text(t("btnCancel"), "wallet_recharge_cancel");

  await context.reply(
    `${t("rechargeCardTitle")}\n\n${t("rechargePaymentLink" as any, amount.toString())}`,
    { reply_markup: keyboard, parse_mode: "HTML" },
  );

  await context.reply(t("rechargePaymentPending" as any), {
    parse_mode: "HTML",
  });
}

/**
 * پردازش نهایی پرداخت کریپتو و اضافه کردن اعتبار به کیف پول
 */
async function processCryptoPayment(
  userId: number,
  amount: number,
  txId: string,
) {
  // افزایش موجودی کاربر
  await UserRepository.updateWalletBalance(userId, amount, "add");

  // ثبت تراکنش
  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "recharge",
    `Crypto recharge - TxID: ${txId}`,
  );
}

/**
 * پردازش callback از درگاه‌های پرداخت (زرین پال / کارت)
 * این تابع باید در یک route جداگانه برای webhook فراخوانی شود
 */
export async function handlePaymentCallback(
  userId: number,
  amount: number,
  method: "zarinpal" | "card",
  paymentId: string,
  status: "success" | "failed",
) {
  if (status === "success") {
    // افزایش موجودی کاربر
    await UserRepository.updateWalletBalance(userId, amount, "add");

    // ثبت تراکنش
    await WalletRepository.addCredit(
      userId,
      amount.toString(),
      "recharge",
      `${method} recharge - Payment ID: ${paymentId}`,
    );

    // پاک کردن state
    rechargeState.delete(userId);

    // ارسال پیام به کاربر
    // TODO: باید instance بات را اینجا داشته باشیم تا بتوانیم پیام بفرستیم
    // await bot.sendMessage(userId, context.t("rechargePaymentSuccess", amount.toString()));
  } else {
    // پاک کردن state
    rechargeState.delete(userId);

    // ارسال پیام به کاربر
    // await bot.sendMessage(userId, context.t("rechargePaymentFailed"));
  }
}

/**
 * توابع کمکی برای افزایش موجودی از سایر منابع
 */

/**
 * افزایش موجودی از ریفرال
 */
export async function addReferralReward(
  userId: number,
  amount: number,
  referredUserId: number,
) {
  await UserRepository.updateWalletBalance(userId, amount, "add");

  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "referral",
    `Referral reward from user ${referredUserId}`,
  );
}

/**
 * افزایش موجودی از Perks
 */
export async function addPerkReward(
  userId: number,
  amount: number,
  perkName: string,
) {
  await UserRepository.updateWalletBalance(userId, amount, "add");

  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "perk",
    `Perk reward: ${perkName}`,
  );
}

/**
 * بازگشت وجه
 */
export async function processRefund(
  userId: number,
  amount: number,
  orderId: number,
  reason: string,
) {
  await UserRepository.updateWalletBalance(userId, amount, "add");

  await WalletRepository.addCredit(
    userId,
    amount.toString(),
    "refund",
    `Refund for order #${orderId}: ${reason}`,
  );
}

/**
 * تعدیل توسط ادمین
 */
export async function adminAdjustment(
  userId: number,
  amount: number,
  type: "add" | "subtract",
  reason: string,
) {
  await UserRepository.updateWalletBalance(userId, amount, type);

  if (type === "add") {
    await WalletRepository.addCredit(
      userId,
      amount.toString(),
      "admin_adjustment",
      reason,
    );
  } else {
    await WalletRepository.debitBalance(
      userId,
      amount.toString(),
      "admin_adjustment",
      undefined,
      reason,
    );
  }
}
