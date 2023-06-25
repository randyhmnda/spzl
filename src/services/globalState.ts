import "dotenv/config";

import { GlobalSateApp, IBotConfig } from "../interfaces.js";
import axios from "axios";
import { Telegraf } from "telegraf";
import TaskManager from "../taskManager.js";

class GlobalState {
  apps: GlobalSateApp[];
  startTime: number;

  constructor() {
    this.apps = [];
    this.startTime = Date.now();
  }

  async initialize() {
    const env = process.env;
    const configUrl = env.CONFIG_URL;

    if (!configUrl) {
      throw Error("Please provide CONFIG_URL");
    }
    const response = await axios.get<IBotConfig>(configUrl);
    const botConfig = response.data;

    this.apps = botConfig.map((config) => {
      const { name, botToken, vidGroupId, baseGroupId } = config;
      const bot = new Telegraf(botToken);
      const taskManager = new TaskManager(bot, Number(vidGroupId), Number(baseGroupId));

      return { name, bot, vidGroupId, baseGroupId, taskManager };
    });
  }
}
const globalState = new GlobalState();

export default globalState;
