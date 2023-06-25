import getPayload from "../getPayload.js";
import globalState from "../services/globalState.js";
import { CommandContext } from "../interfaces.js";

const apps = globalState.apps;

export default async function changeBaseGroupHandler(ctx: CommandContext) {
  try {
    const token = ctx.telegram.token;
    const app = apps.find((app) => token === app.bot.telegram.token);
    if (!app) return;
    const baseGroupId = getPayload(ctx.message.text);
    app.taskManager.baseGroupId = Number(baseGroupId);
    app.baseGroupId = baseGroupId;
    return ctx.reply("Done!!");
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
}
