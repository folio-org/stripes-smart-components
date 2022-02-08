import {
  interactor,
  scoped,
} from '@bigtest/interactor';
import { TextField as TextFieldInteractor } from '@folio/stripes-testing';

export default interactor(class AddressEditInteractor {
  addressType = scoped('[data-test-addresstype]', TextFieldInteractor('Address Type'));
  addressLine1 = scoped('[data-test-addressline1]', TextFieldInteractor('Address Line 1'));
  addressLine2 = scoped('[data-test-addressline2]', TextFieldInteractor('Address Line 2'));
  stateRegion = scoped('[data-test-stateregion]', TextFieldInteractor('State/Prov/Region'));
  zipCode = scoped('[data-test-zipcode]', TextFieldInteractor('Zip/Postal Code'));
  country = scoped('[data-test-country]', TextFieldInteractor('Country'));
  city = scoped('[data-test-city]', TextFieldInteractor('City'));
});
