export default function getNoteDetailsLength(content) {
  const temp = document.createElement('div');
  temp.innerHTML = content;

  return temp.textContent || temp.innerText;
}
