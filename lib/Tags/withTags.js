import React from 'react';
import PropTypes from 'prop-types';

// HOC used to manage tag settings
const withTags = WrappedComponent =>
  class WithTagsComponent extends React.Component {
    static manifest = Object.freeze(
      Object.assign({}, WrappedComponent.manifest, {
        tagSettings: {
          type: 'okapi',
          records: 'configs',
          path: 'configurations/entries?query=(module==TAGS and configName==tags_enabled)',
        },
      }),
    );

    static propTypes = {
      resources: PropTypes.shape({
        tagSettings: PropTypes.object,
      }),
      mutator: PropTypes.shape({
        tagSettings: PropTypes.object,
      }),
    };

    areTagsEnabled() {
      const { resources } = this.props;
      const tagSettings = (resources.tagSettings || {}).records || [];
      const config = tagSettings[0];
      return config && config.value === 'true';
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
