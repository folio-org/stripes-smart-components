import { beforeEach, describe, it } from '@bigtest/mocha';
import React from 'react';
import { expect } from 'chai';
import { faker } from '@bigtest/mirage';

import NotesSmartAccordion from '../NotesSmartAccordion';

import { mount, setupApplication, wait } from '../../../../tests/helpers';
import { NotesAccordion, NotesModal } from './interactors';

const notesAccordion = new NotesAccordion();
const notesModal = new NotesModal();

describe('Notes smart accordion', () => {
  setupApplication();

  let provider;
  let generalNoteType;
  let urgentNoteType;
  let providerNote;

  beforeEach(function () {
    const domainName = 'dummy';

    // Provider is an example of entity. Any another entity type can be used. e.g. User, Agreement...
    provider = {
      id: faker.random.uuid(),
      name: 'Cool Provider'
    };

    generalNoteType = this.server.create('note-type', {
      name: 'General',
    });

    urgentNoteType = this.server.create('note-type', {
      name: 'Urgent',
    });

    providerNote = this.server.create('note', {
      type: generalNoteType.name,
      typeId: generalNoteType.id,
      links: [{ type: 'provider', id: provider.id }],
    });

    this.server.create('note', {
      type: generalNoteType.name,
      typeId: generalNoteType.id,
      links: [{ type: 'package', id: faker.random.uuid() }],
    });

    this.server.create('note', {
      type: urgentNoteType.name,
      typeId: urgentNoteType.id,
      links: [{ type: 'package', id: faker.random.uuid() }],
    });

    mount(
      <div style={{ maxWidth: '500px', marginLeft: '20px' }}>
        <NotesSmartAccordion
          id="notes-accordion"
          open
          onToggle={() => {}}
          domainName={domainName}
          entityName={provider.name}
          entityType="provider"
          entityId={provider.id}
          pathToNoteCreate={`${domainName}/notes/new`}
          pathToNoteDetails={`${domainName}/notes`}
        />
      </div>
    );
  });

  it('should display notes accordion', () => {
    expect(notesAccordion.isDisplayed).to.be.true;
  });

  it('notes accordion should contain 1 note', () => {
    expect(notesAccordion.notes().length).to.equal(1);
  });

  it('should display create note button', () => {
    expect(notesAccordion.newButtonDisplayed).to.be.true;
  });

  it('should display assign button', () => {
    expect(notesAccordion.assignButtonDisplayed).to.be.true;
  });

  it('should display notes list', () => {
    expect(notesAccordion.notesListDisplayed).to.be.true;
  });

  describe('when new button was clicked', () => {
    beforeEach(async () => {
      await notesAccordion.newButton.click();
    });

    it('should redirect to create note page', function () {
      expect(this.location.pathname).to.equal('/dummy/notes/new');
    });
  });

  describe('when a note in the notes list was clicked', () => {
    beforeEach(async () => {
      await notesAccordion.notes(0).click();
    });

    it('should redirect to note view page', function () {
      expect(this.location.pathname + this.location.search).to.equal(`/dummy/notes/${providerNote.id}`);
    });
  });

  describe('when assign button was clicked', () => {
    beforeEach(async () => {
      await notesAccordion.assignButton.click();
    });

    it('should open notes modal', () => {
      expect(notesModal.isDisplayed).to.be.true;
    });

    it('should disable search button', () => {
      expect(notesModal.searchButtonIsDisabled).to.be.true;
    });

    it('should display empty message', () => {
      expect(notesModal.emptyMessageIsDisplayed).to.be.true;
    });

    describe('after click on note assigned to only one entity', () => {
      beforeEach(async () => {
        await notesModal.selectAssignedFilter();
        await notesModal.notes(0).clickCheckbox();
      });

      it('should not allow to unassign', () => {
        expect(notesModal.notes(0).checkboxIsDisabled).to.be.true;
        expect(notesModal.notes(0).checkboxIsSelected).to.be.true;
      });
    });

    describe('after click on "assign/unassign all" checkbox', () => {
      beforeEach(async () => {
        await notesModal.selectAssignedFilter();
        await notesModal.clickAssignUnassignAllCheckbox();
      });

      it('should not allow to unassign notes assigned to only one entity', () => {
        expect(notesModal.notes(0).checkboxIsSelected).to.be.true;
        expect(notesModal.assignUnassignAllCheckboxIsDisabled).to.be.true;
      });
    });

    describe('and search box and filters are not empty', () => {
      beforeEach(async () => {
        await notesModal.enterSearchQuery('some note');
        await wait(300);
        await notesModal.noteTypeFilter.options(1).clickOption();
        await notesModal.selectUnassignedFilter();
        await notesModal.resetAll();
      });

      it('should reset search box and all filters', () => {
        expect(notesModal.searchQueryText).to.have.lengthOf(0);
      });
    });

    describe('and "Urgent" note type was selected', () => {
      beforeEach(async () => {
        await notesModal.noteTypeFilter.options(1).clickOption();
      });

      it('notes list should contain 1 note', () => {
        expect(notesModal.notes().length).to.equal(1);
      });

      describe('and note type filter was cleared', () => {
        beforeEach(async () => {
          await notesModal.noteTypeFilter.clear();
        });

        it('should display empty message', () => {
          expect(notesModal.emptyMessageIsDisplayed).to.be.true;
        });
      });
    });

    describe('and search query was entered', () => {
      beforeEach(async () => {
        await notesModal.enterSearchQuery('some note');
        await wait(300);
      });

      it('should enable search button', () => {
        expect(notesModal.searchButtonIsDisabled).to.be.false;
      });

      describe('and the search button was clicked', () => {
        beforeEach(async () => {
          await notesModal.clickSearchButton();
        });

        it('should display notes list', () => {
          expect(notesModal.notesListIsDisplayed).to.be.true;
        });
      });

      describe('and unassigned filter was selected', () => {
        beforeEach(async () => {
          await notesModal.selectUnassignedFilter();
        });

        it('notes list should contain 2 notes', () => {
          expect(notesModal.notes().length).to.equal(2);
        });

        it('notes list should display only unselected notes', () => {
          expect(notesModal.notes(0).checkboxIsSelected).to.be.false;
          expect(notesModal.notes(1).checkboxIsSelected).to.be.false;
        });

        describe('and the first note in the list was checked', () => {
          beforeEach(async () => {
            await notesModal.notes(0).clickCheckbox();
          });

          describe('and save button was clicked', () => {
            beforeEach(async () => {
              await notesModal.clickSaveButton();
            });

            it('should close notes modal', () => {
              expect(notesModal.isDisplayed).to.be.false;
            });

            it('notes accordion should contain 2 notes', () => {
              expect(notesAccordion.notes().length).to.equal(2);
            });
          });
        });

        describe('and "assign all" checkbox is clicked', () => {
          beforeEach(async () => {
            await notesModal.clickAssignUnassignAllCheckbox();
          });

          it('should mark as assigned all notes in the list', () => {
            expect(notesModal.notes(0).checkboxIsSelected).to.be.true;
            expect(notesModal.notes(1).checkboxIsSelected).to.be.true;
          });

          describe('and save button was clicked', () => {
            beforeEach(async () => {
              await notesModal.clickSaveButton();
            });

            it('should close notes modal', () => {
              expect(notesModal.isDisplayed).to.be.false;
            });
          });
        });
      });
    });
  });

  describe('when a note in the notes list was clicked', () => {
    beforeEach(async () => {
      await notesAccordion.notes(0).click();
    });

    it('should redirect to note view page', function () {
      expect(this.location.pathname + this.location.search).to.equal(`/dummy/notes/${providerNote.id}`);
    });
  });
});
