import React from 'react';
import PropTypes from 'prop-types';
import { MentionWrapper, MentionMenu } from 'react-githubish-mentions';
import TextArea from '@folio/stripes-components/lib/TextArea';

const MenuItem = (props) => {
  const { active, value } = props;
  const customStyle = {
    background: active ? '#106c9e' : '#fff',
    color: active ? '#efefef' : '#333',
  };
  return <span style={customStyle}>{value}</span>;
};

class AtMentionTextArea extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      users: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
  }

  static manifest = Object.freeze({
    users: {
      type: 'okapi',
      path: 'users',
      records: 'users',
      clear: false,
      GET: {
        params: {
          query: 'username=^%{username}*',
        },
      },
    },
    username: {},
  });

  constructor(props) {
    super(props);
    this.atQuery = this.atQuery.bind(this);
  }

  atQuery(query) {
    this.props.mutator.username.replace(query.toLowerCase());
    return ((this.props.resources.users || {}).records || [])
      .map(u => ({ value: u.username }));
  }

  render() {
    return (
      <MentionWrapper component={TextArea} {...this.props} bottomMargin0 >
        <MentionMenu className="mentionMenuStyle" trigger="@" item={MenuItem} resolve={this.atQuery} />
      </MentionWrapper>
    );
  }
};

export default AtMentionTextArea;
