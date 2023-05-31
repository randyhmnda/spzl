import { Telegraf } from "telegraf";

async function alreadyJoinChat(app: Telegraf, chatId: number, userId: number) {
  const { status } = await app.telegram.getChatMember(chatId, userId);
  return status === "administrator" || status === "creator" || status === "member" || status === "restricted";
}

export default alreadyJoinChat;
