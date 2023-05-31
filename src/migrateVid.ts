import { Context, NarrowedContext, TelegramError } from "telegraf";
import { Update, Message } from "telegraf/types";
import getPayload from "./getPayload.js";
import sleep from "./sleep.js";

async function migrateVid(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >
) {
  const message = ctx.message;
  const destinationId = getPayload(message.text);

  if (!destinationId) return ctx.reply("Please provide destination group id");
  if (!message.reply_to_message) {
    return ctx.reply("Please reply to the latest message");
  }
  const latestMessageId = message.reply_to_message.message_id;

  for (let currentMessageId = 1; currentMessageId <= latestMessageId; currentMessageId++) {
    try {
      await sleep(1);
      await ctx.telegram.copyMessage(destinationId, ctx.chat.id, currentMessageId);
    } catch (err) {
      if (err instanceof TelegramError) {
        if (err.message === "400: Bad Request: chat not found") {
          return ctx.reply("Bot haven't joined the destination group or yet to be an admin");
        } else if (err.response.error_code === 429) {
          const totalSeconds = err.response.parameters?.retry_after;
          console.log(`sleep for ${totalSeconds} seconds`);
          await sleep(totalSeconds || 0);
        } else if ((err.message = "400: Bad Request: the message can't be copied")) {
          console.log(currentMessageId, err.message);
          continue;
        } else {
          console.log(currentMessageId, err.message);
          return ctx.reply(err.message);
        }
      } else {
        console.log(currentMessageId, (err as Error).message);
        return ctx.reply((err as Error).message);
      }
    }
  }
  await ctx.reply("Done!!");
}

export default migrateVid;
