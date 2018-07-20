import { chunk } from 'lodash';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Button from '@folio/stripes-components/lib/Button';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import { getFullName, isProxyExpired, isSponsorExpired, isRequestForSponsorInvalid } from './proxyUtil';
import css from './ProxyForm.css';

function renderEnabledRadio(proxy) {
  return (
    <Field
      component={RadioButton}
      type="radio"
      id={`proxy-${proxy.id}`}
      key={`proxy-${proxy.id}`}
      name="sponsorId"
      label={getFullName(proxy)}
      value={proxy.id}
    />
  );
}

class ProxyForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    intl: intlShape,
    onCancel: PropTypes.func,
    patron: PropTypes.object,
    proxies: PropTypes.arrayOf(PropTypes.object),
    proxiesFor: PropTypes.arrayOf(PropTypes.object),
    sponsorOf: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    const { proxiesFor, sponsorOf } = props;

    this.proxiesMap = proxiesFor.reduce((memo, p) => {
      memo[p.userId] = p;
      return memo;
    }, {});

    this.sponsorsMap = sponsorOf.reduce((memo, s) => {
      memo[s.proxyUserId] = s;
      return memo;
    }, {});
  }

  translate(id) {
    const { intl } = this.props;
    return intl.formatMessage({ id: `stripes-smart-components.pm.${id}` });
  }

  renderDisabledRadio(proxy, sponsor, proxyMap) {
    let message;

    if (isProxyExpired(proxy, proxyMap)) {
      message = this.translate('proxyExpired');
    } else if (isSponsorExpired(sponsor)) {
      message = this.translate('sponsorExpired');
    } else if (isRequestForSponsorInvalid(proxy, proxyMap)) {
      message = this.translate('cannotRequestFoSponsor');
    }

    return message && (
      <div>
        <input id={`proxy-${proxy.id}`} type="radio" disabled className={css.disabled} />
        <label htmlFor={`proxy-${proxy.id}`} className={css.label}>{getFullName(proxy)}</label>
        <div className={css.error}>{message}</div>
      </div>
    );
  }

  render() {
    const { handleSubmit, onCancel, patron, proxies, intl } = this.props;
    const proxiesList = chunk(proxies, 3).map((group, i) => (
      <Row key={`row-${i}`}>
        {group.map(proxy => (
          <Col xs={12} key={`col-${proxy.id}`}>
            {
              this.renderDisabledRadio(proxy, patron, this.proxiesMap) ||
              renderEnabledRadio(proxy)
            }
          </Col>
        ))}
      </Row>
    ));

    return (
      <form id="proxy-form" onSubmit={handleSubmit}>
        <Row>
          <Col xs={12}>
            <FormattedMessage id="stripes-smart-components.isActingAs" values={{ name: <strong>{getFullName(patron)}</strong> }} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              component={RadioButton}
              type="radio"
              id={`sponsor-${patron.id}`}
              key={`sponsor-${patron.id}`}
              name="sponsorId"
              label={intl.formatMessage({ id: 'stripes-smart-components.self' })}
              value={patron.id}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <FormattedMessage id="stripes-smart-components.actingAsProxyFor" tagName="strong" />
          </Col>
        </Row>
        {proxiesList}
        <br />
        <Row>
          <Col xs={3}>
            <Button onClick={onCancel} buttonStyle="secondary" fullWidth>{this.translate('cancel')}</Button>
          </Col>
          <Col xs={3}>
            <Button type="submit" fullWidth>{this.translate('continue')}</Button>
          </Col>
        </Row>
      </form>
    );
  }
}

export default reduxForm({
  form: 'proxyForm',
})(ProxyForm);
