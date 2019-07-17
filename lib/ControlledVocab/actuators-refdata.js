// Actuator functions for Refdata controlled vocabulary
// Used when client code calls <ControlledVocab actuatorType="refdata">
// For Refdata API, see https://github.com/openlibraryenvironment/ui-directory/blob/master/doc/refdata-api.md
// Each of these should return a promise that resolves when the operation is complete

function createRefdata(item) {
  const tweakedItem = this.props.preCreateHook(item);
  const instruction = {
    values: [tweakedItem]
  };
  return this.props.mutator.refdataValues.PUT(instruction);
}

function deleteRefdata() {
  const item = this.state.selectedItem;
  this.props.mutator.activeRecord.update({ id: item.id });
  const instruction = {
    values: [{ id: item.id, _delete: true }]
  };

  // XXX too much intelligence here: the handling should be moved up into a wrapper
  return this.props.mutator.refdataValues.PUT(instruction)
    .then(() => {
      this.showDeletionSuccessCallout(item);
      this.deleteItemResolve();
    })
    .catch(() => {
      this.setState({ showItemInUseDialog: true });
      this.deleteItemReject();
    })
    .finally(() => this.hideConfirmDialog());
}

function updateRefdata(item) {
  this.props.mutator.activeRecord.update({ id: item.id });
  const tweakedItem = this.props.preUpdateHook(item);
  const instruction = {
    // The item should already include its own ID
    values: [tweakedItem]
  };
  return this.props.mutator.refdataValues.PUT(instruction);
}

export default function (that) {
  return {
    onCreate: createRefdata.bind(that),
    onDelete: deleteRefdata.bind(that),
    onUpdate: updateRefdata.bind(that),
  };
}
