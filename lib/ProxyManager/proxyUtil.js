import { get } from 'lodash';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies

export function isUserExpired(user) {
  return user?.expirationDate && moment(user.expirationDate).isSameOrBefore(new Date());
}

export function isProxyExpired(user, proxyMap) {
  const selectedProxy = proxyMap[user.id];

  return isUserExpired(selectedProxy);
}

export function isRequestForSponsorNotAllowed(user, proxyMap) {
  const REQUEST_FOR_SPONSOR_ARE_NOT_ALLOWED = 'No';
  const selectedProxy = proxyMap[user.id];

  return selectedProxy?.requestForSponsor === REQUEST_FOR_SPONSOR_ARE_NOT_ALLOWED;
}

export function getFullName(user) {
  const lastName = get(user, ['personal', 'lastName'], '');
  const firstName = get(user, ['personal', 'firstName'], '');
  const middleName = get(user, ['personal', 'middleName'], '');
  const preferredFirstName = get(user, ['personal', 'preferredFirstName'], '');
  const displayedFirstName = preferredFirstName || firstName;

  return `${lastName}${displayedFirstName ? ', ' : ' '}${displayedFirstName} ${middleName}`;
}
