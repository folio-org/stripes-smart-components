import React from 'react';
import PropTypes from 'prop-types';
import { MetaSection } from '@folio/stripes-components';
import {
  withStripes,
  stripesShape,
} from '@folio/stripes-core';

class ViewMetaData extends React.Component {
  static propTypes = {
    metadata: PropTypes.object,
    stripes: stripesShape.isRequired,
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
    this.fetchUsers();
  }

  async fetchUsers() {
    const {
      metadata: {
        createdByUserId,
        updatedByUserId,
      },
    } = this.props;

    // fetch once if users are identical
    if (createdByUserId === updatedByUserId) {
      const user = await this.fetchUser(createdByUserId);

      this.setState({
        createdBy: user,
        updatedBy: user,
      });

      return;
    }

    const [createdBy, updatedBy] = await Promise.all([
      this.fetchUser(createdByUserId),
      this.fetchUser(updatedByUserId),
    ]);

    this.setState({
      createdBy,
      updatedBy,
    });
  }

  async fetchUser(userId) {
    const systemId = '00000000-0000-0000-0000-000000000000';

    // no unnecessary fetch if user is System
    if (userId === systemId) {
      const { systemUser } = this.props;

      return systemUser;
    }

    const {
      stripes: {
        okapi: {
          tenant,
          token,
          url: host,
        }
      }
    } = this.props;

    try {
      const response = await fetch(`${host}/users?query=(id==${userId})`, {
        method: 'GET',
        headers: {
          'X-Okapi-Tenant': tenant,
          'X-Okapi-Token': token,
        },
      });
      const { users: [user] } = await response.json();

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

export default withStripes(ViewMetaData);
