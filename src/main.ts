import express from "express";
import axios from "axios";
import { Telegraf, Input, Composer } from "telegraf";
import getPayload from "./getPayload.js";
import "dotenv/config";
import alreadyJoinChat from "./alreadyJoinChat.js";
import { IBotConfig, ICDNSyndicationResponse } from "./interfaces.js";
import { UpdateType } from "telegraf/typings/telegram-types.js";
import TaskManager from "./taskManager.js";
import getvidlinks from "./getVidLinks.js";
import migrateVid from "./migrateVid.js";

const env = process.env;
const startTime = +new Date();
const configUrl = env.CONFIG_URL;

if (!configUrl) {
  throw Error("Please provide CONFIG_URL");
}
const response = await axios.get<IBotConfig>(configUrl);
const botConfig = response.data;
const apps = botConfig.map((config) => {
  const { name, botToken, vidGroupId, baseGroupId } = config;
  const bot = new Telegraf(botToken);
  const taskManager = new TaskManager(bot, Number(vidGroupId), Number(baseGroupId));

  return { name, bot, vidGroupId, baseGroupId, taskManager };
});
const composer = new Composer();
const server = express();
const port = env.PORT || 8080;

composer.command("/d", async (ctx) => {
  try {
    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
    const tweetUrl = getPayload(ctx.message.text);
    const vidLinks = await getvidlinks(tweetUrl);

    vidLinks.forEach(async (link) => {
      await ctx.telegram.sendVideo(ctx.chat.id, Input.fromURL(link));
    });
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
});
composer.on("chat_member", async (ctx) => {
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
});
composer.command("getvidlinks", async (ctx) => {
  try {
    const tweetUrl = getPayload(ctx.message.text);
    const vidLinks = await getvidlinks(tweetUrl);
    const text = vidLinks.join("\n\n");
    if (!text) return ctx.reply("Link not found");
    return ctx.reply(text);
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
});
composer.command("changevidgroupid", async (ctx) => {
  try {
    const token = ctx.telegram.token;
    const app = apps.find((app) => token === app.bot.telegram.token);
    if (!app) return;
    const vidGroupId = getPayload(ctx.message.text);
    app.taskManager.vidGroupId = Number(vidGroupId);
    app.vidGroupId = vidGroupId;
    return ctx.reply("Done!!");
  } catch (err) {
    console.log(err);
    return ctx.reply((err as any).message);
  }
});
composer.command("changebasegroupid", async (ctx) => {
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
});
composer.command("getconfig", async (ctx) => {
  const config = apps.map((app) => {
    return {
      name: app.name,
      baseGroupId: app.baseGroupId,
      vidGroupId: app.vidGroupId,
    };
  });
  return ctx.reply(JSON.stringify(config));
});
composer.command("/getactivetask", async (ctx) => {
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
});
composer.command("/migrate", async (ctx) => {
  migrateVid(ctx);
});
composer.command("/id", async (ctx) => {
  return ctx.reply(`${ctx.chat.id}`);
});
composer.command("/uptime", async (ctx) => {
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
});
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
