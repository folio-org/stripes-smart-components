import { listSortByLowerCase } from './EntrySelector';

describe('listSortByLowerCase', () => {
  it('sorts by [key] when key is present', () => {
    const list = [
      { id: 'AA', name: 'Aa' },
      { id: 'Ab', name: 'Ab' },
      { id: 'b', name: 'b' },
      { id: 'c', name: 'C' },
    ];

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    expect(listSortByLowerCase(shuffled, 'name')).toEqual(list);
  });

  it('sorts by [id] when key is missing', () => {
    const list = [
      { id: 'Aa' },
      { id: 'Ab', name: 'Ab' },
      { id: 'b', name: 'b' },
      { id: 'c', name: 'C' },
    ];

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    expect(listSortByLowerCase(shuffled, 'name')).toEqual(list);
  });
});
