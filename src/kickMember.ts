import { Telegraf } from "telegraf";
import { Message } from "typegram";
import fiveMinutes from "./fiveMinutes.js";
import mention from "./mention.js";

async function kickMember(app: Telegraf, userId: number, vidGroupId: number) {
  const member = await app.telegram.getChatMember(vidGroupId, userId);
  const tag = mention(member.user.first_name, userId);
  const executeTime = 5 * 60000;
  let message: Message.TextMessage;

  if (member.status === "administrator" || member.status === "creator") {
    message = await app.telegram.sendMessage(vidGroupId, `tidak bisa di kick karena ${tag} adalah seorang admin`, {
      parse_mode: "HTML",
    });
  } else {
    await app.telegram.banChatMember(vidGroupId, userId, fiveMinutes());
    message = await app.telegram.sendMessage(vidGroupId, `${tag} telah di kick!!`, { parse_mode: "HTML" });
  }
  setTimeout(async () => {
    await app.telegram.deleteMessage(vidGroupId, message.message_id);
  }, executeTime);
}

export default kickMember;
