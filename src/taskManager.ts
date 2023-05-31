import { Telegraf } from "telegraf";
import { User } from "telegraf/typings/core/types/typegram";
import getInviteLink from "./getInviteLink.js";
import { ITask } from "./interfaces.js";
import kickMember from "./kickMember.js";
import mention from "./mention.js";

class TaskManager {
  app: Telegraf;
  task: ITask;
  vidGroupId: number;
  baseGroupId: number;
  ms: number;

  constructor(app: Telegraf, vidGroupId: number, baseGroupId: number) {
    this.app = app;
    this.task = {};
    this.vidGroupId = vidGroupId;
    this.baseGroupId = baseGroupId;
    this.ms = 5 * 60000;
  }
  async welcome(user: User) {
    const message = await this.app.telegram.sendMessage(
      this.vidGroupId,
      `welcome ${mention(user.first_name, user.id)}\n\ncepat join grup ini ${await getInviteLink(
        this.app,
        this.baseGroupId
      )} atau lu akan terkick dalam waktu 5 menit`,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
    const kickMemberTimeout = setTimeout(async () => {
      await kickMember(this.app, user.id, this.vidGroupId);
    }, this.ms);
    const deleteMessageTimeout = setTimeout(async () => {
      await this.app.telegram.deleteMessage(this.vidGroupId, message.message_id);
    }, this.ms);
    const clearTaskTimeout = setTimeout(() => {
      // this is needed for the sake of typescript
      // see https://t.me/thedevs_js/516215
      const userTask = this.task[user.id];

      if (userTask) {
        delete userTask.joiningVidGroup;
      }
    }, this.ms);

    this.task[user.id] = {
      joiningVidGroup: {
        messageId: message.message_id,
        kickMemberTimeout,
        deleteMessageTimeout,
        clearTaskTimeout,
      },
    };
  }
  async verify(user: User) {
    const tag = mention(user.first_name, user.id);
    await this.clearTask(user);

    const message = await this.app.telegram.sendMessage(this.vidGroupId, `oke ${tag} anda tidak jadi di kick`, {
      parse_mode: "HTML",
    });
    setTimeout(async () => {
      await this.app.telegram.deleteMessage(this.vidGroupId, message.message_id);
    }, this.ms);
  }
  async warn(user: User) {
    const message = await this.app.telegram.sendMessage(
      this.vidGroupId,
      `brody ${mention(
        user.first_name,
        user.id
      )}\nkarena lu telah keluar maka lu akan otomatis gw kick dalam 5 menit yahaha\n\nuntuk membatalkan silahkan gabung kembali ${await getInviteLink(
        this.app,
        this.baseGroupId
      )}`,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
    const kickMemberTimeout = setTimeout(async () => {
      await kickMember(this.app, user.id, this.vidGroupId);
    }, this.ms);
    const deleteMessageTimeout = setTimeout(async () => {
      await this.app.telegram.deleteMessage(this.vidGroupId, message.message_id);
    }, this.ms);
    const clearTaskTimeout = setTimeout(() => {
      // this is needed for the sake of typescript
      // see https://t.me/thedevs_js/516215
      const userTask = this.task[user.id];

      if (userTask) {
        delete userTask.leavingBaseGroup;
      }
    }, this.ms);

    this.task[user.id] = {
      leavingBaseGroup: {
        messageId: message.message_id,
        kickMemberTimeout,
        deleteMessageTimeout,
        clearTaskTimeout,
      },
    };
  }
  async clearTask(user: User) {
    const currentUser = this.task[user.id];
    if (!currentUser) return;

    if (currentUser.joiningVidGroup) {
      clearTimeout(currentUser.joiningVidGroup.kickMemberTimeout);
      clearTimeout(currentUser.joiningVidGroup.deleteMessageTimeout);
      clearTimeout(currentUser.joiningVidGroup.clearTaskTimeout);

      await this.app.telegram.deleteMessage(this.vidGroupId, currentUser.joiningVidGroup.messageId);
      delete currentUser.joiningVidGroup;
    }
    if (currentUser.leavingBaseGroup) {
      clearTimeout(currentUser.leavingBaseGroup.kickMemberTimeout);
      clearTimeout(currentUser.leavingBaseGroup.deleteMessageTimeout);
      clearTimeout(currentUser.leavingBaseGroup.clearTaskTimeout);

      await this.app.telegram.deleteMessage(this.vidGroupId, currentUser.leavingBaseGroup.messageId);
      delete currentUser.leavingBaseGroup;
    }
    if (!currentUser.joiningVidGroup && !currentUser.leavingBaseGroup) {
      delete this.task[user.id];
    }
  }
}

export default TaskManager;
