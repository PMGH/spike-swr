function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const swrFetcher = async (url: string) => {
  await timeout(3000);
  return fetch(url).then(res => res.json());
}
