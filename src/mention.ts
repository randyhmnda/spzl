function mention(name: string, id: number) {
  return `<a href="tg://user?id=${id}">${name}</a>`;
}

export default mention;
