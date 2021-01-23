import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Callout } from '@folio/stripes-components';

import ConfigForm from './ConfigForm';

class ConfigManager extends React.Component {
  static manifest = Object.freeze({
    recordId: {},
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module==!{moduleName} and configName==!{configName})',
      POST: {
        path: 'configurations/entries',
      },
      PUT: {
        path: 'configurations/entries/%{recordId}',
      },
    },
  });

  static propTypes = {
    calloutMessage: PropTypes.node,
    children: PropTypes.node,
    configFormComponent: PropTypes.func,
    configName: PropTypes.string.isRequired,
    getInitialValues: PropTypes.func,
    label: PropTypes.node.isRequired,
    moduleName: PropTypes.string.isRequired,
    mutator: PropTypes.shape({
      recordId: PropTypes.shape({
        replace: PropTypes.func,
      }),
      settings: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }).isRequired,
    onAfterSave: PropTypes.func,
    onBeforeSave: PropTypes.func,
    resources: PropTypes.object.isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }),
    validate: PropTypes.func,
  };

  static defaultProps = {
    calloutMessage: <FormattedMessage id="stripes-smart-components.cm.success" />
  };

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
      if (this.callout) {
        this.callout.sendCallout({ message: calloutMessage });
      }
      if (onAfterSave) onAfterSave(setting);
    });
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
      >
        {children}
      </ConfigFormComponent>
    );
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

  render() {
    const settings = (this.props.resources.settings || {});

    if (settings && settings.hasLoaded) {
      return (
        <div style={{ width: '100%' }}>
          {this.getConfigForm()}
          <Callout ref={(ref) => { this.callout = ref; }} />
        </div>
      );
    }

    return <div />;
  }
}

export default ConfigManager;
