function escape(text: string) {
  return text.replace(/&/gi, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;");
}

export default escape;
