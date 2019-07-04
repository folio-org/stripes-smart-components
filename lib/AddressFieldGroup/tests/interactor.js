import {
  interactor,
  scoped,
} from '@bigtest/interactor';
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';

export default interactor(class AddressEditInteractor {
  addressType= scoped('[data-test-addressType]', TextFieldInteractor);
  addressLine1= scoped('[data-test-addressLine1]', TextFieldInteractor);
  addressLine2= scoped('[data-test-addressLine2]', TextFieldInteractor);
  stateRegion= scoped('[data-test-stateRegion]', TextFieldInteractor);
  zipCode= scoped('[data-test-zipCode]', TextFieldInteractor);
  country= scoped('[data-test-country]', TextFieldInteractor);
  city= scoped('[data-test-city]', TextFieldInteractor);
});
