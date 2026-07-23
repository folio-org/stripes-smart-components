import { describe, it } from 'mocha';
import makeRefdataActuatorsBoundTo from '../actuators-refdata';

describe('ControlledVocab', () => {
  describe('Refdata actuators run', () => {
    const mock = {
      state: {
        selectedItem: { id: 123 },
      },
      props: {
        mutator: {
          activeRecord: {
            update: (_val) => {},
          },
          refdataValues: {
            PUT: (_instruction) => new Promise((resolve, _reject) => {
              resolve();
            }),
          }
        },
        preCreateHook: (rec) => rec,
        preUpdateHook: (rec) => rec,
      },
      hideConfirmDialog: () => {},
      showDeletionSuccessCallout: () => {},
      deleteItemResolve: () => {},
      deleteItemReject: () => {},
    };

    const actuators = makeRefdataActuatorsBoundTo(mock);

    it('create function', () => {
      actuators.onCreate({ id: 42, element: 'water' });
    });
    it('delete function', () => {
      actuators.onDelete();
    });
    it('udate function', () => {
      actuators.onUpdate({ id: 42, element: 'earth' });
    });
  });
});
