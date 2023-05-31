import { Telegraf, deunionize } from "telegraf";

async function getInviteLink(app: Telegraf, chatId: number) {
  const chat = await app.telegram.getChat(chatId);
  const inviteLink = deunionize(chat).invite_link;

  if (inviteLink) return inviteLink;
  else return app.telegram.exportChatInviteLink(chatId);
}

export default getInviteLink;
