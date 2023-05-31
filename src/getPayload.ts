function getPayload(text: string) {
  return text.split(" ").slice(1).join(" ");
}

export default getPayload;
