import TaskManager from "./taskManager.js";

export interface ICDNSyndicationResponse {
  mediaDetails: {
    type?: "video";
    video_info: {
      variants: {
        bitrate: number;
        content_type: "video/mp4" | "application/x-mpegURL";
        url: string;
      }[];
    };
  }[];
}
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
