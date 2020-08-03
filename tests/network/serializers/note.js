import { JSONAPISerializer } from 'miragejs';

export default JSONAPISerializer.extend({
  serialize(notes) {
    return notes.models
      ? notes.models.reduce((response, note) => {
        return {
          notes: [
            ...response.notes,
            { ...note.attrs },
          ],
          totalRecords: ++response.totalRecords
        };
      }, { notes: [], totalRecords: 0 })
      : notes.attrs;
  }
});
