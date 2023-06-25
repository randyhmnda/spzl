import { CommandContext } from "../interfaces.js";
import globalState from "../services/globalState.js";

const startTime = globalState.startTime;

export default async function uptimeHandler(ctx: CommandContext) {
  try {
    let uptimeTotal = Math.abs(+new Date() - startTime) / 1000;
    const uptimeHours = Math.floor(uptimeTotal / 3600);
    uptimeTotal -= uptimeHours * 3600;
    const uptimeMinutes = Math.floor(uptimeTotal / 60) % 60;
    uptimeTotal -= uptimeMinutes * 60;
    const uptimeSeconds = (uptimeTotal % 60).toFixed();

    if (uptimeHours !== 0 && uptimeMinutes !== 0)
      await ctx.reply(`${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`);
    else if (uptimeHours === 0 && uptimeMinutes !== 0) {
      await ctx.reply(`${uptimeMinutes}m ${uptimeSeconds}s`);
    } else {
      await ctx.reply(`${uptimeSeconds}s`);
    }
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
}
