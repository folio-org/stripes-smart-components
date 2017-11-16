import React from 'react';
import PropTypes from 'prop-types';
import TextArea from '@folio/stripes-components/lib/TextArea';
import separateComponentProps from '@folio/stripes-components/util/separateComponentProps';
import { MentionWrapper, MentionMenu } from '@folio/react-githubish-mentions';
import css from './Notes.css';

const MenuItem = (props) => {
  const { active, value } = props;
  const customStyle = {
    background: active ? '#106c9e' : '#fff',
    color: active ? '#efefef' : '#333',
    display: 'block',
  };
  return <span style={customStyle}>{value}</span>;
};

MenuItem.propTypes = {
  active: PropTypes.bool,
  value: PropTypes.string,
};

class AtMentionTextArea extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      users: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      username: PropTypes.object,
    }),
    input: PropTypes.shape({
      onChange: PropTypes.func,
    }),
    dataKey: PropTypes.string,
    okapi: PropTypes.object,
    refreshRemote: PropTypes.func,
    meta: PropTypes.object,
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
    this.onChange = this.onChange.bind(this);
  }

  atQuery(query) {
    this.props.mutator.username.replace(query.toLowerCase());
    return ((this.props.resources.users || {}).records || [])
      .map(u => ({ value: u.username }));
  }

  onChange(e, v) {
    this.props.input.onChange(v);
  }

  render() {
    const [, inputProps] = separateComponentProps(this.props, AtMentionTextArea.propTypes);
    return (
      <MentionWrapper {...inputProps} component={TextArea} onChange={this.onChange} bottomMargin0 >
        <MentionMenu className={css.atMentionMenu} trigger="@" item={MenuItem} resolve={this.atQuery} />
      </MentionWrapper>
    );
  }
}

export default AtMentionTextArea;
