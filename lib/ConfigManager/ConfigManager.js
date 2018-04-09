import React from 'react';
import PropTypes from 'prop-types';
import Callout from '@folio/stripes-components/lib/Callout';

import ConfigForm from './ConfigForm';

class ConfigManager extends React.Component {
  static propTypes = {
    resources: PropTypes.object.isRequired,
    mutator: PropTypes.shape({
      recordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      settings: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
    label: PropTypes.string.isRequired,
    validate: PropTypes.func,
    stripes: PropTypes.object,
    configName: PropTypes.string.isRequired,
    moduleName: PropTypes.string.isRequired,
    onBeforeSave: PropTypes.func,
    onAfterSave: PropTypes.func,
    getInitialValues: PropTypes.func,
    calloutMessage: PropTypes.string,
    configFormComponent: PropTypes.func,
    children: PropTypes.node,
  };

  static defaultProps = {
    calloutMessage: 'Setting was successfully updated.',
  };

  static manifest = Object.freeze({
    recordId: {},
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=!{moduleName} and configName=!{configName})',
      POST: {
        path: 'configurations/entries',
      },
      PUT: {
        path: 'configurations/entries/%{recordId}',
      },
    },
  });

  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
  }

  onSave(data) {
    const { resources, mutator, moduleName, configName, calloutMessage, onBeforeSave, onAfterSave } = this.props;
    const value = (onBeforeSave) ? onBeforeSave(data) : data[configName];
    const setting = Object.assign({}, resources.settings.records[0], {
      module: moduleName,
      configName,
      value,
    });

    const action = (setting.id) ? 'PUT' : 'POST';

    if (setting.id) mutator.recordId.replace(setting.id);
    if (setting.metadata) delete setting.metadata;

    return mutator.settings[action](setting).then(() => {
      this.callout.sendCallout({ message: calloutMessage });
      if (onAfterSave) onAfterSave(setting);
    });
  }

  getInitialValues() {
    const { resources, configName, getInitialValues } = this.props;
    const settings = (resources.settings || {}).records || [];

    if (getInitialValues) {
      return getInitialValues(settings);
    }

    const value = settings.length === 0 ? '' : settings[0].value;
    return { [configName]: value };
  }

  getConfigForm() {
    const { label, children } = this.props;
    const initialValues = this.getInitialValues();
    const ConfigFormComponent = (this.props.configFormComponent) ?
      this.props.configFormComponent : ConfigForm;

    return (
      <ConfigFormComponent
        onSubmit={this.onSave}
        validate={this.props.validate}
        initialValues={initialValues}
        label={label}
        stripes={this.props.stripes}
      >{children}
      </ConfigFormComponent>
    );
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        {this.getConfigForm()}
        <Callout ref={(ref) => { this.callout = ref; }} />
      </div>
    );
  }
}

export default ConfigManager;
