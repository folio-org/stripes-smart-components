import { get } from 'lodash';
import { dayjs } from '@folio/stripes-components';

export function isProxyExpired(user, proxyMap) {
  const proxy = proxyMap[user.id];
  return proxy && proxy.expirationDate &&
    dayjs(proxy.expirationDate).isSameOrBefore(new Date());
}

export function isSponsorExpired(sponsor) {
  return sponsor && sponsor.expirationDate &&
    dayjs(sponsor.expirationDate).isSameOrBefore(new Date());
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
