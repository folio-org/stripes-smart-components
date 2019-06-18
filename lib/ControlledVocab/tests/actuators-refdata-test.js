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
            update: (val) => {},
          },
          refdataValues: {
            PUT: (instruction) => new Promise((resolve, reject) => {
              resolve();
            }),
          }
        },
        preCreateHook: (rec) => rec,
        preUpdateHook: (rec) => rec,
      }
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
