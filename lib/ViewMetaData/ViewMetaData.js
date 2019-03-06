import React from 'react';
import PropTypes from 'prop-types';
import { MetaSection } from '@folio/stripes-components';

class ViewMetaData extends React.Component {
  static manifest = Object.freeze({
    createdBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{metadata.createdByUserId})',
      fetch: false,
      accumulate: true,
    },
    updatedBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{metadata.updatedByUserId})',
      fetch: false,
      accumulate: true,
    },
  });

  static propTypes = {
    metadata: PropTypes.object,
    mutator: PropTypes.shape({
      createdBy: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
      updatedBy: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    systemId: PropTypes.string,
    systemUser: PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.string,
        personal: PropTypes.shape({
          firstName: PropTypes.string,
          lastName: PropTypes.string,
          middleName: PropTypes.string,
        }),
      }),
      PropTypes.string,
    ]),
  };

  static defaultProps = {
    metadata: {},
    systemUser: 'System',
  };

  state = {
    createdBy: null,
    updatedBy: null,
  };

  componentDidMount() {
    this.getUsers();
  }

  async getUsers() {
    const {
      metadata: {
        createdByUserId,
        updatedByUserId,
      },
    } = this.props;

    // fetch once if users are identical
    if (createdByUserId === updatedByUserId) {
      const user = await this.getCreatedByUser();

      this.setState({
        createdBy: user,
        updatedBy: user,
      });

      return;
    }

    const [createdBy, updatedBy] = await Promise.all([
      this.getCreatedByUser(),
      this.getUpdatedByUser(),
    ]);

    this.setState({
      createdBy,
      updatedBy,
    });
  }

  async getCreatedByUser() {
    const {
      mutator,
      metadata: { createdByUserId },
      systemId,
      systemUser,
    } = this.props;

    if (systemId && createdByUserId === systemId) {
      return systemUser;
    }

    try {
      mutator.createdBy.reset();
      const [user] = await mutator.createdBy.GET();

      return user;
    } catch (error) {
      // return null if user was not fetched
      return null;
    }
  }

  async getUpdatedByUser() {
    const {
      mutator,
      metadata: { updatedByUserId },
      systemId,
      systemUser,
    } = this.props;

    if (systemId && updatedByUserId === systemId) {
      return systemUser;
    }

    try {
      mutator.updatedBy.reset();
      const [user] = await mutator.updatedBy.GET();

      return user;
    } catch (error) {
      // return null if user was not fetched
      return null;
    }
  }

  render() {
    const {
      metadata: {
        createdDate,
        updatedDate,
      },
    } = this.props;
    const {
      createdBy,
      updatedBy,
    } = this.state;

    return (
      <MetaSection
        id="instanceRecordMeta"
        contentId="instanceRecordMetaContent"
        createdBy={createdBy}
        lastUpdatedBy={updatedBy}
        createdDate={createdDate}
        lastUpdatedDate={updatedDate}
      />
    );
  }
}

export default ViewMetaData;
