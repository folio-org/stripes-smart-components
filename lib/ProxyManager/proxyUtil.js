import { get } from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies

export function isProxyExpired(user, proxyMap) {
  const proxy = proxyMap[user.id];
  return proxy && proxy.expirationDate &&
    moment(proxy.expirationDate).isSameOrBefore(new Date());
}

export function isSponsorExpired(sponsor) {
  return sponsor && sponsor.expirationDate &&
    moment(sponsor.expirationDate).isSameOrBefore(new Date());
}

export function isRequestForSponsorInvalid(user, proxyMap) {
  const proxy = proxyMap[user.id];
  return proxy && proxy.requestForSponsor === 'No';
}

export function getFullName(user) {
  const lastName = get(user, ['personal', 'lastName'], '');
  const firstName = get(user, ['personal', 'firstName'], '');
  const middleName = get(user, ['personal', 'middleName'], '');
  const preferredFirstName = get(user, ['personal', 'preferredFirstName'], '');
  const displayedFirstName = preferredFirstName || firstName;

  return `${lastName}${displayedFirstName ? ', ' : ' '}${displayedFirstName} ${middleName}`;
}
