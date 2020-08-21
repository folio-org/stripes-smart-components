/**
 * Returns characters length in DOM tree
 *
 * @param {string} htmlString DOM tree
 * @returns {number} characters length
 */
export default function getStringLength(htmlString) {
  const element = document.createElement('div');
  let stringLength = 0;

  element.innerHTML = htmlString;

  function recurse(currentNode) {
    const nodeValue = currentNode.nodeValue;

    if (nodeValue) {
      stringLength += nodeValue.length;
    }

    for (let i = 0; currentNode.childNodes && i < currentNode.childNodes.length; i++) {
      recurse(currentNode.childNodes[i]);
    }

    return stringLength;
  }

  return recurse(element);
}
