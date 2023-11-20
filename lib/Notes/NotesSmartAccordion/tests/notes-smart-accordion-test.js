import { beforeEach, describe, it } from '@bigtest/mocha';
import React from 'react';
import { expect } from 'chai';

import NotesSmartAccordion from '../NotesSmartAccordion';

import { mount, setupApplication, wait } from '../../../../tests/helpers';
import { NotesAccordion, NotesModal } from './interactors';

const notesAccordion = new NotesAccordion();
const notesModal = new NotesModal();

describe('Notes smart accordion', () => {
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

    it('should display notes accordion', () => {
      expect(notesAccordion.isDisplayed).to.be.true;
    });

    it('notes accordion should contain 2 assigned notes', () => {
      expect(notesAccordion.notes().length).to.equal(4);
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
        expect(this.location.pathname + this.location.search).to.equal('/dummy/notes/providerNoteId');
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

      describe('after click on note assigned to a couple of entities and hitting save', () => {
        beforeEach(async () => {
          await notesModal.selectAssignedFilter();
          await notesModal.notes(1).clickCheckbox();
          await notesModal.clickSaveButton();
        });

        it('should unassign it', () => {
          expect(notesAccordion.notes().length).to.equal(3);
        });
      });

      describe('after click on "assign/unassign all" checkbox', () => {
        beforeEach(async () => {
          await notesModal.selectAssignedFilter();
          await notesModal.clickAssignUnassignAllCheckbox();
        });

        it('should not allow to uncheck notes assigned to only one entity', () => {
          expect(notesModal.notes(0).checkboxIsSelected).to.be.true;
        });

        it('should uncheck notes assigned to more then one entity', () => {
          expect(notesModal.notes(1).checkboxIsSelected).to.be.false;
        });
      });

      describe('and search box and filters were reset', () => {
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

        it('notes list should contain 2 notes', () => {
          expect(notesModal.notes().length).to.equal(2);
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

              it('notes accordion should contain 4 notes', () => {
                expect(notesAccordion.notes().length).to.equal(4);
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
        expect(this.location.pathname + this.location.search).to.equal('/dummy/notes/providerNoteId');
      });
    });

    describe('when note details have fewer than 255 characters', () => {
      beforeEach(async () => {
        await notesAccordion.whenNotesLoaded();
      });

      it('should not display "Show more" button', () => {
        expect(notesAccordion.notes(0).isShowMoreShown).to.be.false;
      });

      it('should display "Edit" button', () => {
        expect(notesAccordion.notes(0).isEditShown).to.be.true;
      });

      describe('when clicking on "Edit" button', () => {
        beforeEach(async () => {
          await notesAccordion.notes(0).edit();
        });

        it('should redirect to note edir page', function () {
          expect(this.location.pathname).to.equal('/dummy/notes/providerNoteId/edit');
        });
      });
    });

    describe('when clicking on notes list column heading', () => {
      beforeEach(async () => {
        await notesAccordion.whenNotesLoaded();
      });

      it('should display correct dates', () => {
        expect(notesAccordion.notes(0).date).to.equal('12/4/2020');
        expect(notesAccordion.notes(1).date).to.equal('12/4/2019');
        expect(notesAccordion.notes(2).date).to.equal('12/4/2018');
        expect(notesAccordion.notes(3).date).to.equal('11/4/2017');
      });

      it('should display correct titles', () => {
        expect(notesAccordion.notes(0).title).to.equal('Title: A Note type');
        expect(notesAccordion.notes(1).title).to.equal('Title: C Note type');
        expect(notesAccordion.notes(2).title).to.equal('Title: A Note type');
        expect(notesAccordion.notes(3).title).to.equal('Title: A Note type');
      });

      it('should display correct types', () => {
        expect(notesAccordion.notes(0).type).to.equal('General');
        expect(notesAccordion.notes(1).type).to.equal('General');
        expect(notesAccordion.notes(2).type).to.equal('Urgent');
        expect(notesAccordion.notes(3).type).to.equal('General');
      });

      describe('when clicking on date column heading', () => {
        beforeEach(async () => {
          await notesAccordion.dateColumnHeading.click();
        });

        it('should sort notes by date', () => {
          expect(notesAccordion.notes(0).date).to.equal('11/4/2017');
          expect(notesAccordion.notes(1).date).to.equal('12/4/2018');
          expect(notesAccordion.notes(2).date).to.equal('12/4/2019');
          expect(notesAccordion.notes(3).date).to.equal('12/4/2020');
        });
      });

      describe('when clicking on title and details column heading', () => {
        beforeEach(async () => {
          await notesAccordion.titleAndDetailsColumnHeading.click();
        });

        it('should sort notes by title', () => {
          expect(notesAccordion.notes(0).title).to.equal('Title: C Note type');
          expect(notesAccordion.notes(1).title).to.equal('Title: A Note type');
          expect(notesAccordion.notes(2).title).to.equal('Title: A Note type');
        });
      });

      describe('when clicking on type column heading', () => {
        beforeEach(async () => {
          await notesAccordion.typeColumnHeading.click();
        });

        it('should sort notes by type', () => {
          expect(notesAccordion.notes(0).type).to.equal('Urgent');
          expect(notesAccordion.notes(1).type).to.equal('General');
          expect(notesAccordion.notes(2).type).to.equal('General');
        });
      });
    });

    describe('when note details have more than 255 characters', () => {
      beforeEach(async () => {
        await notesAccordion.whenNotesLoaded();
      });

      it('should only show 255 characters', () => {
        expect(notesAccordion.notes(1).details.length).to.equal(255);
      });

      it('should display "Show more" button', () => {
        expect(notesAccordion.notes(1).isShowMoreShown).to.be.true;
      });

      it('should display "Edit" button', () => {
        expect(notesAccordion.notes(1).isEditShown).to.be.true;
      });

      describe('when clicking on "Show more"', () => {
        beforeEach(async () => {
          await notesAccordion.notes(1).showMore();
        });

        it('should show full details', () => {
          expect(notesAccordion.notes(1).details.length).to.equal(260);
        });

        it('should change "Show more" to "Show less"', () => {
          expect(notesAccordion.notes(1).showMoreButtonText).to.equal('Show less');
        });
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

    it('should not display create note button', () => {
      expect(notesAccordion.newButtonDisplayed).to.be.false;
    });
  });
});
