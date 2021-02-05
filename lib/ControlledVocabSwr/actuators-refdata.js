// Actuator functions for Refdata controlled vocabulary
// Used when client code calls <ControlledVocab actuatorType="refdata">
// For Refdata API, see https://github.com/openlibraryenvironment/ui-directory/blob/master/doc/refdata-api.md
// Each of these should return a promise that resolves when the operation is complete

const refDataActuators = ({
  ky,
  baseUrl,
  preCreateHook,
  preUpdateHook,
  selectedItem,
  showDeletionSuccessCallout,
  deleteItemResolve,
  deleteItemReject,
  setItemInUseDialogIsVisible
}) => {
  const createRefdata = (item) => {
    const tweakedItem = preCreateHook(item);
    const instruction = {
      values: [tweakedItem]
    };
    return ky.put(baseUrl, instruction);
  };

  const deleteRefdata = () => {
    const item = selectedItem;
    this.props.mutator.activeRecord.update({ id: item.id });
    const instruction = {
      values: [{ id: item.id, _delete: true }]
    };

    // XXX too much intelligence here: the handling should be moved up into a wrapper
    return this.props.mutator.refdataValues.PUT(instruction)
      .then(() => {
        showDeletionSuccessCallout(item);
        deleteItemResolve();
      })
      .catch(() => {
        setItemInUseDialogIsVisible(true);
        deleteItemReject();
      })
      .finally(() => this.hideConfirmDialog());
  };

  const updateRefdata = (item) => {
    const tweakedItem = preUpdateHook(item);
    const instruction = {
      // The item should already include its own ID
      values: [tweakedItem]
    };
    return ky.put(baseUrl, instruction);
  };

  return {
    onCreate: createRefdata,
    onDelete: deleteRefdata,
    onUpdate: updateRefdata,
  };
};

export default refDataActuators;
