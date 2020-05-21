export default (id) => Promise.resolve({
  json: () => Promise.resolve({
    fieldId: id,
    count: parseInt(id, 10),
  }),
});
