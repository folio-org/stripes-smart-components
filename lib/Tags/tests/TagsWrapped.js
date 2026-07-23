import React from 'react';
import PropTypes from 'prop-types';

const TagsWrapped = (
  { resources: {
    tagSettings,
    tagged
  },
  tagsEnabled }
) => (
  <>
    <div>{ tagSettings.records[0]?.module }</div>
    <div>{ tagsEnabled ? 'enabled' : 'disabled' }</div>
    <ul id="taglist" className="list-test">
      { tagged.records?.map(t => <li key={t.label}>{t.label}</li>) }
    </ul>
    <div>{tagSettings.url}</div>
  </>
);


TagsWrapped.manifest = Object.freeze({
  tagged: {
    type: 'okapi',
    path: 'dummy/tagged',
    records: 'tags',
  }
});

TagsWrapped.propTypes = {
  tagSettings: PropTypes.arrayOf(PropTypes.object),
  tagsEnabled: PropTypes.bool,
  resources: PropTypes.shape({
    tagSettings: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object)
    }),
    tagged: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object)
    })
  }),
};

export default TagsWrapped;
