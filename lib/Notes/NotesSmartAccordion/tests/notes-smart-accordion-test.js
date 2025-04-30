import { beforeEach, describe, it } from 'mocha';
import React from 'react';
import { expect } from 'chai';
import {
  MultiColumnList,
  MultiColumnListCell,
  converge,
  including
} from '@folio/stripes-testing';

import NotesSmartAccordion from '../NotesSmartAccordion';

import { mount, setupApplication, wait } from '../../../../tests/helpers';

import { NoteSmartAccordionInteractor, NotesModalInteractor, NoteItemInteractor } from '../../tests/interactors';

describe('Notes smart accordion', () => {
  const notesAccordion = NoteSmartAccordionInteractor();
  const notesModal = NotesModalInteractor();

  describe('when hideNewButton prop is false', () => {
    setupApplication({
      scenarios: ['create-notes-with-note-types']
    });

    beforeEach(async () => {
      const domainName = 'dummy';

      // Provider is an example of entity. Any another entity type can be used. e.g. User, Agreement...
      await mount(
        <div style={{ maxWidth: '500px', marginLeft: '20px' }}>
          <NotesSmartAccordion
            id="notes-accordion"
            open
            onToggle={() => {}}
            domainName={domainName}
            entityName="Cool Provider"
            entityType="provider"
            entityId="providerId"
            pathToNoteCreate={`${domainName}/notes/new`}
            pathToNoteDetails={`${domainName}/notes`}
          />
        </div>
      );
    });

    it('should display notes accordion', () => notesAccordion.exists());

    it('notes accordion should contain 4 assigned notes', () => notesAccordion.has({ noteCount: 4 }));

    it('should display create note button', () => notesAccordion.has({ newButton: true }));

    it('should display assign button', () => notesAccordion.has({ assignButton: true }));

    describe('when new button was clicked', () => {
      beforeEach(async () => {
        await notesAccordion.clickNew();
      });

      it('should redirect to create note page', function () {
        expect(this.location.pathname).to.equal('/dummy/notes/new');
      });
    });

    describe('when a note in the notes list was clicked', () => {
      beforeEach(async () => {
        await notesAccordion.clickNote(0);
      });

      it('should redirect to note view page', function () {
        expect(this.location.pathname + this.location.search).to.equal('/dummy/notes/providerNoteId');
      });
    });

    describe('when assign button was clicked', () => {
      beforeEach(async () => {
        await notesAccordion.clickAssign();
      });

      it('should open notes modal', () => notesModal.exists());

      it('should disable search button', () => notesModal.has({ searchDisabled: true }));

      it('should display empty message', () => notesModal.has({ emptyMessage: true }));

      describe('after click on note assigned to only one entity', () => {
        beforeEach(async () => {
          await notesModal.clickAssignedFilter();
        });

        it('should not allow to unassign', () => notesModal.find(NoteItemInteractor({ index: 0 })).has({ checkboxDisabled: true }));
      });

      describe('after click on note assigned to a couple of entities and hitting save', () => {
        beforeEach(async () => {
          await notesModal.clickAssignedFilter();
          await notesModal.find(NoteItemInteractor({ index: 1 })).clickCheckbox();
          await notesModal.clickSave();
        });

        it('should unassign it', () => notesAccordion.has({ noteCount: 3 }));
      });

      describe('after click on "assign/unassign all" checkbox', () => {
        beforeEach(async () => {
          await notesModal.clickAssignedFilter();
          await converge(() => notesModal.has({ noteCount: 4 }));
          await notesModal.clickAssignAll();
        });

        it('should not allow to uncheck notes assigned to only one entity', () => NoteItemInteractor({ index: 0, checkboxSelected: true }));

        it('should uncheck notes assigned to more then one entity', () => Promise.all([
          NoteItemInteractor({ index: 1, checkboxSelected: false }).exists(),
          NoteItemInteractor({ index: 3, checkboxSelected: false }).exists(),
        ]));
      });

      describe('and search box and filters were reset', () => {
        beforeEach(async () => {
          await notesModal.fillSearch('some note');
          await wait(300); // wait for debounced state update ಠ_ಠ ...
          await notesModal.chooseTypeOption('Urgent');
          await notesModal.clickUnassignedFilter();
          await converge(() => notesModal.has({ noteCount: 1 }));
        });

        it('returns results', () => notesModal.has({ noteCount: 1 }));

        describe('resetting the results', () => {
          beforeEach(async () => {
            await notesModal.clickResetAll();
          });

          it('should reset search box and all filters', () => notesModal.has({ searchText: '' }));
        });
      });

      describe('and "Urgent" note type was selected', () => {
        beforeEach(async () => {
          await notesModal.chooseTypeOption('Urgent');
        });

        it('returns 2 results', () => notesModal.has({ noteCount: 2 }));

        describe('and note type filter was cleared', () => {
          beforeEach(async () => {
            await notesModal.clearTypeFilter();
          });

          it('should display empty message', () => notesModal.has({ emptyMessage: true }));
        });
      });

      describe('and search query was entered', () => {
        beforeEach(async () => {
          await notesModal.fillSearch('some note');
          await wait(300);
        });

        it('should enable search button', () => notesModal.has({ searchDisabled: false }));

        describe('and the search button was clicked', () => {
          beforeEach(async () => {
            await notesModal.clickSearch();
          });

          it('should display notes list', () => notesModal.has({ emptyMessage: false }));
        });

        describe('and unassigned filter was selected', () => {
          beforeEach(async () => {
            await notesModal.clickUnassignedFilter();
          });

          it('returns 2 unassigned results', () => notesModal.has({ noteCount: 2 }));

          it('should display only unchecked notes', () => Promise.all([
            NoteItemInteractor({ index: 0, checkboxSelected: false }).exists(),
            NoteItemInteractor({ index: 1, checkboxSelected: false }).exists(),
          ]));

          describe('and the first note in the list was checked', () => {
            beforeEach(async () => {
              await notesModal.find(NoteItemInteractor({ index: 0 })).clickCheckbox();
            });

            describe('and save button was clicked', () => {
              beforeEach(async () => {
                await notesModal.clickSave();
              });

              it('should close notes modal', () => notesModal.absent());

              it('notes accordion should contain 4 notes', () => notesAccordion.has({ noteCount: 4 }));
            });
          });

          describe('and "assign all" checkbox is clicked', () => {
            beforeEach(async () => {
              await notesModal.clickAssignAll();
            });

            it('should check all notes', () => Promise.all([
              NoteItemInteractor({ index: 0, checkboxSelected: true }).exists(),
              NoteItemInteractor({ index: 1, checkboxSelected: true }).exists(),
            ]));

            describe('and save button was clicked', () => {
              beforeEach(async () => {
                await notesModal.clickSave();
              });

              it('should close notes modal', () => notesModal.absent());
            });
          });
        });
      });
    });

    describe('when a note in the notes list was clicked', () => {
      beforeEach(async () => {
        await notesAccordion.find(NoteItemInteractor({ index: 0 })).click();
      });

      it('should redirect to note view page', function () {
        expect(this.location.pathname + this.location.search).to.equal('/dummy/notes/providerNoteId');
      });
    });

    describe('when note details have fewer than 255 characters', () => {
      beforeEach(async () => {
        await converge(() => notesAccordion.exists());
      });

      it('should not display "Show more" button', () => NoteItemInteractor({ index: 0 }).has({ showMoreDisplayed: false }));

      it('should display "Edit" button', () => NoteItemInteractor({ index: 0 }).has({ editDisplayed: true }));

      describe('when clicking on "Edit" button', () => {
        beforeEach(async () => {
          await NoteItemInteractor({ index: 0 }).clickEdit();
        });

        it('should redirect to note edir page', function () {
          expect(this.location.pathname).to.equal('/dummy/notes/providerNoteId/edit');
        });
      });
    });

    describe('when clicking on notes list column heading', () => {
      beforeEach(async () => {
        await converge(() => notesAccordion.exists());
      });

      it('should display correct dates', () => Promise.all([
        MultiColumnListCell({ row: 0, column: 'Date' }).has({ content: '12/4/2020' }),
        MultiColumnListCell({ row: 1, column: 'Date' }).has({ content: '12/4/2019' }),
        MultiColumnListCell({ row: 2, column: 'Date' }).has({ content: '12/4/2018' }),
        MultiColumnListCell({ row: 3, column: 'Date' }).has({ content: '11/4/2017' }),
      ]));

      it('should display correct titles', () => Promise.all([
        MultiColumnListCell({ row: 0, column: 'Title and details' }).has({ content: including('Title: A Note type') }),
        MultiColumnListCell({ row: 1, column: 'Title and details' }).has({ content: including('Title: C Note type') }),
        MultiColumnListCell({ row: 2, column: 'Title and details' }).has({ content: including('Title: A Note type') }),
        MultiColumnListCell({ row: 3, column: 'Title and details' }).has({ content: including('Title: A Note type') })
      ]));

      it('should display correct types', () => Promise.all([
        MultiColumnListCell({ row: 0, column: 'Type' }).has({ content: 'General' }),
        MultiColumnListCell({ row: 1, column: 'Type' }).has({ content: 'General' }),
        MultiColumnListCell({ row: 2, column: 'Type' }).has({ content: 'Urgent' }),
        MultiColumnListCell({ row: 3, column: 'Type' }).has({ content: 'General' }),
      ]));

      describe('when clicking on date column heading', () => {
        beforeEach(async () => {
          await MultiColumnList().clickHeader('Date');
        });

        it('should sort notes by date', () => Promise.all([
          MultiColumnListCell({ row: 0, column: 'Date' }).has({ content: '11/4/2017' }),
          MultiColumnListCell({ row: 1, column: 'Date' }).has({ content: '12/4/2018' }),
          MultiColumnListCell({ row: 2, column: 'Date' }).has({ content: '12/4/2019' }),
          MultiColumnListCell({ row: 3, column: 'Date' }).has({ content: '12/4/2020' }),
        ]));
      });

      describe('when clicking on title and details column heading', () => {
        beforeEach(async () => {
          await MultiColumnList().clickHeader('Title and details');
        });

        it('should sort notes by title', () => Promise.all([
          MultiColumnListCell({ row: 0, column: 'Title and details' }).has({ content: including('Title: C Note type') }),
          MultiColumnListCell({ row: 1, column: 'Title and details' }).has({ content: including('Title: A Note type') }),
          MultiColumnListCell({ row: 2, column: 'Title and details' }).has({ content: including('Title: A Note type') }),
        ]));
      });

      describe('when clicking on type column heading', () => {
        beforeEach(async () => {
          await MultiColumnList().clickHeader('Type');
        });

        it('should sort notes by type', () => Promise.all([
          MultiColumnListCell({ row: 0, column: 'Type' }).has({ content: 'Urgent' }),
          MultiColumnListCell({ row: 1, column: 'Type' }).has({ content: 'General' }),
          MultiColumnListCell({ row: 2, column: 'Type' }).has({ content: 'General' }),
          MultiColumnListCell({ row: 3, column: 'Type' }).has({ content: 'General' }),
        ]));
      });
    });

    describe('when note details have more than 255 characters', () => {
      const lengthyNoteItem = NoteItemInteractor({ index: 1 });
      beforeEach(async () => {
        await converge(() => notesAccordion.exists());
      });

      it('should only show 255 characters', () => lengthyNoteItem.has({ detailsLength: 255 }));

      it('should display "Show more" button', () => lengthyNoteItem.has({ showMoreDisplayed: true }));

      it('should display "Edit" button', () => lengthyNoteItem.has({ editDisplayed: true }));

      describe('when clicking on "Show more"', () => {
        beforeEach(async () => {
          await lengthyNoteItem.clickShowMore();
        });

        it('should show full details', () => lengthyNoteItem.has({ detailsLength: 260 }));

        it('should change "Show more" to "Show less"', () => lengthyNoteItem.has({ showLessDisplayed: true }));
      });
    });
  });
  describe('when hideNewButton prop is true', () => {
    setupApplication({
      scenarios: ['create-notes-with-note-types']
    });

    beforeEach(async () => {
      const domainName = 'dummy';

      // Provider is an example of entity. Any another entity type can be used. e.g. User, Agreement...
      await mount(
        <div style={{ maxWidth: '500px', marginLeft: '20px' }}>
          <NotesSmartAccordion
            id="notes-accordion"
            open
            onToggle={() => {}}
            domainName={domainName}
            entityName="Cool Provider"
            entityType="provider"
            entityId="providerId"
            pathToNoteCreate={`${domainName}/notes/new`}
            pathToNoteDetails={`${domainName}/notes`}
            hideNewButton
          />
        </div>
      );
    });

    it('should not display create note button', () => notesAccordion.has({ newButton: false }));
  });
});
