export default function asyncSleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
