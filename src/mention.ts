import escape from "./escape.js";

function mention(name: string, id: number) {
  return `<a href="tg://user?id=${id}">${escape(name)}</a>`;
}

export default mention;
