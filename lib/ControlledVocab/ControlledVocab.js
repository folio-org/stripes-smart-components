import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import EditableList from '@folio/stripes-components/lib/structures/EditableList';

class ControlledVocab extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    resources: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      values: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
    visibleFields: PropTypes.arrayOf(
      PropTypes.string,
    ),
    itemTemplate: PropTypes.object,
    nameKey: PropTypes.string,
    additionalFields: PropTypes.object,
  };

  static defaultProps = {
    visibleFields: ['name'],
    itemTemplate: { name: 'string' },
    nameKey: undefined,
    additionalFields: {},
  };

  static manifest = Object.freeze({
    values: {
      type: 'okapi',
      path: '!{baseUrl}',
      records: '!{records}',
      PUT: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
      DELETE: {
        path: '!{baseUrl}/%{activeRecord.id}',
      },
    },
    activeRecord: {},
  });

  constructor(props) {
    super(props);

    this.state = {};

    this.onCreateType = this.onCreateType.bind(this);
    this.onUpdateType = this.onUpdateType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
  }

  onCreateType(type) {
    return this.props.mutator.values.POST(type);
  }

  onUpdateType(type) {
    this.props.mutator.activeRecord.update({ id: type.id });
    // TODO: remove when back end PUT requests ignore read only properties
    // https://issues.folio.org/browse/RMB-92
    delete type.metadata;
    return this.props.mutator.values.PUT(type);
  }

  onDeleteType(typeId) {
    this.props.mutator.activeRecord.update({ id: typeId });
    return this.props.mutator.values.DELETE(this.props.resources.values.records.find(t => t.id === typeId));
  }

  render() {
    if (!this.props.resources.values) return <div />;

    const suppressor = {
      // If a suppressor returns true, the control for that action will not appear
      delete: () => true,
      edit: () => false,
    };

    return (
      <Paneset>
        <Pane defaultWidth="fill" fluidContentWidth paneTitle={this.props.label}>
          <EditableList
            {...this.props}
            // TODO: not sure why we need this OR if there are no groups
            // Seems to load this once before the groups data from the manifest
            // is pulled in. This still causes a JS warning, but not an error
            contentData={this.props.resources.values.records || []}
            createButtonLabel="+ Add new"
            visibleFields={this.props.visibleFields}
            itemTemplate={this.props.itemTemplate}
            actionSuppression={suppressor}
            onUpdate={this.onUpdateType}
            onCreate={this.onCreateType}
            onDelete={this.onDeleteType}
            isEmptyMessage={`There are no ${this.props.label}`}
            nameKey={this.props.nameKey}
            additionalFields={this.props.additionalFields}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default ControlledVocab;
