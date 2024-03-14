export function getTextFile(url) {
  return fetch(url).then((res) => res.text());
}
