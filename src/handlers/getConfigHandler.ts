import globalState from "../services/globalState.js";
import { CommandContext } from "../interfaces.js";

const apps = globalState.apps;

export default async function getConfigHandler(ctx: CommandContext) {
  const config = apps.map((app) => {
    return {
      name: app.name,
      baseGroupId: app.baseGroupId,
      vidGroupId: app.vidGroupId,
    };
  });
  return ctx.reply(JSON.stringify(config));
}
