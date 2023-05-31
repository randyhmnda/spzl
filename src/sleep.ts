function sleep(s: number) {
  const ms = s * 1000;
  return new Promise((res) => setTimeout(res, ms));
}

export default sleep;
