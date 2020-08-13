const ELEMENT_NODE_TYPE = 1;

/**
 * Returns a substring of the required length with HTML tags
 *
 * @param {string} htmlString string with HTML elements
 * @param {number} maxLength required max length of string
 */
export default function getHTMLSubstring(htmlString, maxLength) {
  const element = document.createElement('div');
  const fragment = document.createDocumentFragment();
  let stringLength = 0;

  element.innerHTML = htmlString;

  function recurse(currentNode) {
    const nodeValue = currentNode.nodeValue;
    const clonedNode = currentNode.nodeType === ELEMENT_NODE_TYPE
      ? currentNode.cloneNode(false)
      : document.createDocumentFragment();

    const currentStringLength = nodeValue
      ? stringLength + nodeValue.length
      : stringLength;

    if (nodeValue && currentStringLength <= maxLength) {
      stringLength += nodeValue.length;
      clonedNode.textContent = nodeValue;
    }

    if (nodeValue && currentStringLength > maxLength) {
      const allowableStringLength = maxLength - stringLength;

      stringLength = maxLength;
      clonedNode.textContent = nodeValue.substring(0, allowableStringLength);
    }

    for (let i = 0; currentNode.childNodes && i < currentNode.childNodes.length; i++) {
      if (stringLength >= maxLength) {
        break;
      }

      const childNode = recurse(currentNode.childNodes[i]);

      clonedNode.appendChild(childNode);
    }

    return clonedNode;
  }

  fragment.appendChild(recurse(element));

  return fragment.children[0].innerHTML;
}
