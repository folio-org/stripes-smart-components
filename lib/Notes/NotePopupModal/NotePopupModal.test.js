import { act, render } from '@folio/jest-config-stripes/testing-library/react';

import NotePopupModal, { resetNotePopupTracking } from './NotePopupModal';

// The component imports a CSS file via webpack loader syntax; stub it for Jest.
jest.mock('!style-loader!css-loader!react-quill/dist/quill.snow.css', () => ({}), { virtual: true });

const SESSION_KEY = 'notePopupLastShown';

const NOTE_WITH_POPUP = { id: 'note-1', title: 'Alert', popUpOnUser: true };
const NOTE_WITHOUT_POPUP = { id: 'note-2', title: 'Info', popUpOnUser: false };

const makeMutator = (notes = []) => ({
  NotePopupModal_assignedNotes: {
    GET: jest.fn().mockResolvedValue(notes),
  },
  popupNote: { update: jest.fn() },
  note: { DELETE: jest.fn().mockResolvedValue() },
});

const renderNotePopupModal = (props = {}) => render(
  <NotePopupModal
    domainName="users"
    entityType="user"
    popUpPropertyName="popUpOnUser"
    entityId="user-1"
    mutator={makeMutator()}
    {...props}
  />
);

describe('NotePopupModal', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('resetNotePopupTracking', () => {
    it('removes the specified key, leaving other keys intact', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        popUpOnUser: 'user-1',
        popUpOnCheckOut: 'user-1',
      }));

      resetNotePopupTracking('popUpOnUser');

      const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      expect(stored.popUpOnUser).toBeUndefined();
      expect(stored.popUpOnCheckOut).toBe('user-1');
    });

    it('clears all keys when called without an argument', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        popUpOnUser: 'user-1',
        popUpOnCheckOut: 'user-2',
      }));

      resetNotePopupTracking();

      expect(JSON.parse(sessionStorage.getItem(SESSION_KEY))).toEqual({});
    });

    it('is a no-op when the key does not exist', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ popUpOnCheckOut: 'user-1' }));

      resetNotePopupTracking('popUpOnUser');

      expect(JSON.parse(sessionStorage.getItem(SESSION_KEY))).toEqual({ popUpOnCheckOut: 'user-1' });
    });
  });

  describe('on module load', () => {
    it('clears the session key so the popup re-shows after a page reload', () => {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ popUpOnUser: 'user-1' }));

      jest.isolateModules(() => {
        // Re-requiring re-executes the top-level sessionStorage.removeItem call.
        require('./NotePopupModal');
        expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
      });
    });
  });

  describe('Assigned notes fetch behaviour', () => {
    it('fetches notes on first render for a new entity', async () => {
      const mutator = makeMutator([NOTE_WITH_POPUP]);

      renderNotePopupModal({ mutator });
      await act(async () => {});

      expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(1);
    });

    describe('without preventDuplicates (default)', () => {
      it('fetches again on remount for the same entity', async () => {
        const mutator = makeMutator([NOTE_WITH_POPUP]);

        const { unmount } = renderNotePopupModal({ mutator });
        await act(async () => {});
        unmount();

        renderNotePopupModal({ mutator });
        await act(async () => {});

        expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(2);
      });
    });

    describe('with preventDuplicates', () => {
      it('does not fetch again when remounted for the same entity after the popup was shown', async () => {
        const mutator = makeMutator([NOTE_WITH_POPUP]);

        const { unmount } = renderNotePopupModal({ mutator, preventDuplicates: true });
        await act(async () => {});
        expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(1);

        unmount();

        renderNotePopupModal({ mutator, preventDuplicates: true });
        await act(async () => {});

        // Still 1 — the sessionStorage entry prevented a second fetch.
        expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(1);
      });

      it('does fetch again when remounted for the same entity if no popup notes were found', async () => {
        // GET returns notes, but none have the popup flag set — sessionStorage is not written.
        const mutator = makeMutator([NOTE_WITHOUT_POPUP]);

        const { unmount } = renderNotePopupModal({ mutator, preventDuplicates: true });
        await act(async () => {});
        unmount();

        renderNotePopupModal({ mutator, preventDuplicates: true });
        await act(async () => {});

        expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(2);
      });

      it('fetches again for the same entity after resetNotePopupTracking is called', async () => {
        const mutator = makeMutator([NOTE_WITH_POPUP]);

        const { unmount } = renderNotePopupModal({ mutator, preventDuplicates: true });
        await act(async () => {});
        unmount();

        resetNotePopupTracking('popUpOnUser');

        renderNotePopupModal({ mutator, preventDuplicates: true });
        await act(async () => {});

        expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(2);
      });

      it('tracks different popUpPropertyName contexts independently', async () => {
        const mutatorUsers = makeMutator([{ ...NOTE_WITH_POPUP, popUpOnUser: true }]);
        const mutatorCheckout = makeMutator([{ id: 'note-2', title: 'Alert', popUpOnCheckOut: true }]);

        // Users app shows popup for user-1.
        const { unmount: unmountUsers } = renderNotePopupModal({
          popUpPropertyName: 'popUpOnUser',
          mutator: mutatorUsers,
          preventDuplicates: true,
        });
        await act(async () => {});
        unmountUsers();

        // Check out app opens for the same entity — must still fetch.
        renderNotePopupModal({
          popUpPropertyName: 'popUpOnCheckOut',
          mutator: mutatorCheckout,
          preventDuplicates: true,
        });
        await act(async () => {});

        expect(mutatorUsers.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(1);
        expect(mutatorCheckout.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(1);
      });

      it('fetches when a different entityId is rendered', async () => {
        const mutator = makeMutator([NOTE_WITH_POPUP]);

        const { unmount } = renderNotePopupModal({ entityId: 'user-1', mutator, preventDuplicates: true });
        await act(async () => {});
        unmount();

        renderNotePopupModal({ entityId: 'user-2', mutator, preventDuplicates: true });
        await act(async () => {});

        expect(mutator.NotePopupModal_assignedNotes.GET).toHaveBeenCalledTimes(2);
      });
    });
  });
});
