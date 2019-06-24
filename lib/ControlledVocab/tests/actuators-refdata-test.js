const { describe, it, after } = require('@bigtest/mocha');
const makeRefdataActuatorsBoundTo = require('../actuators-refdata');

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
      showDeletionSuccessCallout: (_item) => {},
      deleteItemResolve: () => {},
      hideConfirmDialog: () => {},
      setState: (_obj) => { throw new Error("setState can't happen"); },
      deleteItemReject: () => { throw new Error("deleteItemReject can't happen"); },
      records: {} // id -> record
    };

    const actuators = makeRefdataActuatorsBoundTo(mock);

    it('create function', () => {
      console.log('create');
      actuators.onCreate({ id: 42, element: 'water' });
    });
    it('delete function', () => {
      console.log('delete');
      actuators.onDelete();
    });
    it('update function', () => {
      console.log('update');
      actuators.onUpdate({ id: 42, element: 'earth' });
      mock.records['foo'] = 42;
    });

    after(() => {
      console.log('all actuator tests done:', mock.records);
    });
  });
});
