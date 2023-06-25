import { CommandContext } from "../interfaces.js";

export default async function idHandler(ctx: CommandContext) {
  return ctx.reply(`${ctx.chat.id}`);
}
