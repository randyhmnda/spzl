import { Context, NarrowedContext, Telegraf } from "telegraf";
import TaskManager from "./taskManager.js";
import { Update, Message } from "telegraf/typings/core/types/typegram.js";

export interface ITask {
  [userId: number]:
    | {
        joiningVidGroup?: {
          messageId: number;
          deleteMessageTimeout: NodeJS.Timeout;
          kickMemberTimeout: NodeJS.Timeout;
          clearTaskTimeout: NodeJS.Timeout;
        };
        leavingBaseGroup?: {
          messageId: number;
          deleteMessageTimeout: NodeJS.Timeout;
          kickMemberTimeout: NodeJS.Timeout;
          clearTaskTimeout: NodeJS.Timeout;
        };
      }
    | undefined;
}

export type IBotConfig = {
  name: string;
  botToken: string;
  vidGroupId: string;
  baseGroupId: string;
  taskManager: TaskManager;
}[];

export interface GlobalSateApp {
  name: string;
  bot: Telegraf;
  vidGroupId: string;
  baseGroupId: string;
  taskManager: TaskManager;
}

export type CommandContext = NarrowedContext<
  Context<Update>,
  {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }
>;

export type ChatMemberContext = NarrowedContext<Context<Update>, Update.ChatMemberUpdate>;
