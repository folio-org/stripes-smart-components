export default function getLinkedEntityTypesArr(links) {
  const linkedEntityTypes = {};
  const linkedArr = [];

  links.forEach(({ type }) => {
    if (linkedEntityTypes[type]) {
      linkedEntityTypes[type] += 1;
    } else {
      linkedEntityTypes[type] = 1;
    }
  });

  Object.keys(linkedEntityTypes).forEach(type => linkedArr.push({ type, count: linkedEntityTypes[type] }));

  return linkedArr;
}
