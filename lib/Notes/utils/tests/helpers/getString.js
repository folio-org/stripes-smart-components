export default function getString(length, character) {
  return new Array(length).fill(character).join('');
}
