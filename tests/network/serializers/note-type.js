import { JSONAPISerializer } from '@bigtest/mirage';

export default JSONAPISerializer.extend({
  serialize(db) {
    return db.models
      ? db.models.reduce((response, noteType) => {
        return {
          noteTypes: [
            ...response.noteTypes,
            { ...noteType.attrs },
          ],
          totalRecords: ++response.totalRecords
        };
      }, { noteTypes: [], totalRecords: 0 })
      : db.attrs;
  }
});
