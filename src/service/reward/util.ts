export const secureRandom = () => {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
};
