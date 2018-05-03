import { get } from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies

export function isProxyExpired(user, proxyMap) {
  const proxy = proxyMap[user.id];
  return proxy && proxy.meta.expirationDate &&
    moment(proxy.meta.expirationDate).isSameOrBefore(new Date());
}

export function isSponsorExpired(sponsor) {
  return sponsor && sponsor.expirationDate &&
    moment(sponsor.expirationDate).isSameOrBefore(new Date());
}

export function isRequestForSponsorInvalid(user, proxyMap) {
  const proxy = proxyMap[user.id];
  return proxy && proxy.meta.requestForSponsor === 'No';
}

export function getFullName(user) {
  return `${get(user, ['personal', 'lastName'], '')},
    ${get(user, ['personal', 'firstName'], '')}
    ${get(user, ['personal', 'middleName'], '')}`;
}
