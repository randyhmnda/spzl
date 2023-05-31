import axios from "axios";
import { ICDNSyndicationResponse } from "./interfaces.js";

async function getvidlinks(tweetUrl: string) {
  const tweetId = new URL(tweetUrl).pathname.split("/")[3];
  const cdnSyndicationUrl = "https://cdn.syndication.twimg.com/tweet-result?id=" + tweetId;
  const response = await axios.get<ICDNSyndicationResponse>(cdnSyndicationUrl);
  const vids = response.data.mediaDetails.filter((media) => media.type === "video");
  const mp4Vids = vids.map((vid) => vid.video_info.variants.filter((variant) => variant.content_type === "video/mp4"));

  const vidLinks = mp4Vids.map((vid) => {
    const highestBitrate = Math.max(...vid.map((variant) => variant.bitrate));
    const bestVideo = vid.find((variant) => variant.bitrate === highestBitrate);
    return bestVideo!.url;
  });

  return vidLinks;
}

export default getvidlinks;
