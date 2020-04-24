// parseFilters parses a string like
//    departments.123,coursetypes.abc,coursetypes.def
// into an object mapping filter-name to lists of values;
// and deparseFilters performs the opposite operation

export function parseFilters(filters) {
  if (!filters) return {};
  const byName = {};

  filters.split(',').forEach(string => {
    const [name, value] = string.split('.');
    if (!byName[name]) byName[name] = [];
    byName[name].push(value);
  });

  return byName;
}

export function deparseFilters(byName) {
  const a = [];

  Object.keys(byName).sort().forEach(name => {
    const values = byName[name];
    values.forEach(value => {
      a.push(`${name}.${value}`);
    });
  });

  return a.join(',');
}
