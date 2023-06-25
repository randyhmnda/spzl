import globalState from "../services/globalState.js";
import { CommandContext } from "../interfaces.js";

const apps = globalState.apps;

export default async function getActiveTaskHandler(ctx: CommandContext) {
  try {
    const token = ctx.telegram.token;
    const app = apps.find((app) => token === app.bot.telegram.token);
    if (!app) return;
    const activeTask = app.taskManager.task;
    const userIds = Object.keys(activeTask);
    const messageText = userIds
      .map((userId) => {
        const userTask = activeTask[Number(userId)];
        if (!userTask) return;
        const userTaskNames = Object.keys(userTask).join(" ");
        return `${userId}: ${userTaskNames}`;
      })
      .join("\n");

    if (!messageText) {
      return ctx.reply("There is no active task");
    }
    return ctx.reply(messageText);
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
}
