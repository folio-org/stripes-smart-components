import {
  interactor,
  scoped,
} from '@bigtest/interactor';
import { TextField as TextFieldInteractor } from '@folio/stripes-testing';

export default interactor(class AddressEditInteractor {
  addressType= scoped('[data-test-addressType]', TextFieldInteractor('Address Type'));
  addressLine1= scoped('[data-test-addressLine1]', TextFieldInteractor('Address Line 1'));
  addressLine2= scoped('[data-test-addressLine2]', TextFieldInteractor('Address Line 2'));
  stateRegion= scoped('[data-test-stateRegion]', TextFieldInteractor('State/Prov/Region'));
  zipCode= scoped('[data-test-zipCode]', TextFieldInteractor('Zip/Postal Code'));
  country= scoped('[data-test-country]', TextFieldInteractor('Country'));
  city= scoped('[data-test-city]', TextFieldInteractor('City'));
});
