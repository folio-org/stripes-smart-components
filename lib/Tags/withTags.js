import React from 'react';
import PropTypes from 'prop-types';

// HOC used to manage tag settings
const withTags = WrappedComponent => class WithTagsComponent extends React.Component {
  static manifest = Object.freeze(
    Object.assign({}, WrappedComponent.manifest, {
      tagSettings: {
        type: 'okapi',
        path: (_q, _p, _r, _l, props) => {
          const { tagsScope } = props;
          const configName = 'tags_enabled';

          return tagsScope
            ? `settings/entries?query=(scope==${tagsScope} and key==${configName})`
            : `configurations/entries?query=(module==TAGS and configName==${configName})`;
        },
      },
    }),
  );

  static propTypes = {
    mutator: PropTypes.shape({
      tagSettings: PropTypes.object,
    }),
    resources: PropTypes.shape({
      tagSettings: PropTypes.object,
    }),
    tagsScope: PropTypes.string,
  };

  areTagsEnabled() {
    const {
      resources,
      tagsScope,
    } = this.props;
    const data = resources.tagSettings.records[0] || {};
    const tagSettings = (tagsScope
      ? data.items
      : data.configs) || [];

    return !tagSettings.length || tagSettings[0].value === 'true';
  }

  render() {
    const tagsEnabled = this.areTagsEnabled();

    return (<WrappedComponent
      tagsEnabled={tagsEnabled}
      {...this.props}
    />);
  }
};

export default withTags;
