import "dotenv/config";

import express from "express";
import { Composer } from "telegraf";
import { UpdateType } from "telegraf/typings/telegram-types.js";
import globalState from "./services/globalState.js";
import chatMemberHandler from "./handlers/chatMemberHandler.js";
import changeVidGroupHandler from "./handlers/changeVidGroupHandler.js";
import changeBaseGroupHandler from "./handlers/changeBaseGroupHandler.js";
import getConfigHandler from "./handlers/getConfigHandler.js";
import getActiveTaskHandler from "./handlers/getActiveTaskHandler.js";
import idHandler from "./handlers/idHandler.js";
import uptimeHandler from "./handlers/uptimeHandler.js";

await globalState.initialize();

const apps = globalState.apps;
const env = process.env;
const composer = new Composer();
const server = express();
const port = env.PORT || 8080;

composer.on("chat_member", chatMemberHandler);

composer.command("changevidgroupid", changeVidGroupHandler);
composer.command("changebasegroupid", changeBaseGroupHandler);
composer.command("getconfig", getConfigHandler);
composer.command("/getactivetask", getActiveTaskHandler);
composer.command("/id", idHandler);
composer.command("/uptime", uptimeHandler);

const allowedUpdates: UpdateType[] = ["message", "chat_member"];

apps.forEach((app) => {
  app.bot.use(composer);
  app.bot.telegram.getMe().then((me) => {
    console.log(`Successfully logged in for ${app.name} as ${me.username}`);
  });
});
if (env.DEVELOPMENT) {
  apps.forEach((app) => app.bot.launch({ allowedUpdates, dropPendingUpdates: true }));
} else {
  const domain = env.WEBHOOK_DOMAIN;

  if (!domain) {
    throw Error("Please provide WEBHOOK_DOMAIN");
  }
  for (let i = 0; i < apps.length; i++) {
    server.use(
      await apps[i].bot.createWebhook({
        domain,
        allowed_updates: allowedUpdates,
        path: "/" + apps[i].name,
      })
    );
  }
  server.listen(port, () => console.log(`Server listening on ${port}`));
}

process.once("SIGINT", () => apps.forEach((app) => app.bot.stop("SIGINT")));
process.once("SIGTERM", () => apps.forEach((app) => app.bot.stop("SIGTERM")));
