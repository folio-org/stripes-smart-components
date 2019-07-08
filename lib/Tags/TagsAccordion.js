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

const TagsAccordion = React.memo(({ link }) => (
  <Tags link={link}>
    {({
      entityTags,
      tagsForm,
    }) => (
      <Accordion
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
      >
        {tagsForm}
      </Accordion>
    )}
  </Tags>
));

TagsAccordion.propTypes = { link: PropTypes.string.isRequired };

export default TagsAccordion;
