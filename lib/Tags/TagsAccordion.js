import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedNumber,
} from 'react-intl';
import {
  Accordion,
  Headline,
  Badge,
} from '@folio/stripes-components';

import Tags from './Tags';

const TagsAccordion = React.memo(({ link, getEntity, getEntityTags, entityTagsPath, hasOptimisticLocking }) => (
  <Tags link={link} getEntity={getEntity} getEntityTags={getEntityTags} entityTagsPath={entityTagsPath} hasOptimisticLocking={hasOptimisticLocking}>
    {({
      entityTags,
      tagsForm,
    }) => (
      <Accordion
        id="tag-accordion"
        label={(
          <Headline
            size="large"
            tag="h3"
          >
            <FormattedMessage id="stripes-smart-components.tags" />
          </Headline>
        )}
        displayWhenClosed={(
          <Badge size="small">
            <FormattedNumber value={entityTags.length} />
          </Badge>
        )}
        closedByDefault={!entityTags?.length}
      >
        {tagsForm}
      </Accordion>
    )}
  </Tags>
));

TagsAccordion.propTypes = {
  entityTagsPath: PropTypes.string,
  getEntity: PropTypes.func,
  getEntityTags: PropTypes.func,
  hasOptimisticLocking: PropTypes.bool,
  link: PropTypes.string.isRequired,
};

export default TagsAccordion;
