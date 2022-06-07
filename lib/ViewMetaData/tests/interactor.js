import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import MetaSectionInteractor from '@folio/stripes-components/lib/MetaSection/tests/interactor';

export default interactor(class ViewMetaDataInteractor {
  metaSection = scoped(MetaSectionInteractor.defaultScope, MetaSectionInteractor);
});
