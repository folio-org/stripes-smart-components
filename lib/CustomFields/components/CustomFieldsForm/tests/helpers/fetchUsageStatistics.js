export const fetchUsageStatistics = (id) => Promise.resolve({
  json: () => Promise.resolve({
    fieldId: id,
    count: parseInt(id),
  }),
});
