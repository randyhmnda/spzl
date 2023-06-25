import alreadyJoinChat from "../alreadyJoinChat.js";
import globalState from "../services/globalState.js";
import { ChatMemberContext } from "../interfaces.js";

const apps = globalState.apps;

export default async function chatMemberHandler(ctx: ChatMemberContext) {
  try {
    const token = ctx.telegram.token;
    const app = apps.find((app) => token === app.bot.telegram.token);

    if (!app) return;

    const taskManager = app.taskManager;
    const vidGroupId = Number(app.vidGroupId);
    const baseGroupId = Number(app.baseGroupId);
    const oldMember = ctx.chatMember.old_chat_member;
    const newMember = ctx.chatMember.new_chat_member;
    const user = newMember.user;
    const oldMemberJoinStatus = ["left", "kicked"];
    const oldMemberLeftStatus = ["member", "restricted"];

    if (newMember.status === "member" && oldMemberJoinStatus.includes(oldMember.status)) {
      if (ctx.chat.id === vidGroupId) {
        if (!(await alreadyJoinChat(app.bot, baseGroupId, user.id))) {
          await taskManager.welcome(user);
        }
      }
      if (ctx.chat.id === baseGroupId) {
        if (await alreadyJoinChat(app.bot, vidGroupId, user.id)) {
          await taskManager.clearTask(user);
          await taskManager.verify(user);
        }
      }
    } else if (newMember.status === "left" && oldMemberLeftStatus.includes(oldMember.status)) {
      await taskManager.clearTask(user);

      if (ctx.chat.id === baseGroupId) {
        if (await alreadyJoinChat(app.bot, vidGroupId, user.id)) {
          await taskManager.warn(user);
        }
      }
    }
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
}
