import {
  interactor,
  text
} from '@bigtest/interactor';

export default interactor(class ViewMetaDataInteractor {
  updaterName = text('#instanceRecordMeta div[class^="metaSectionContent"] div[class^="metaSectionContentBlock"]');
  updaterDate = text('#instanceRecordMeta button');
  creatorName = text('#instanceRecordMeta div[class^="metaSectionContent"] div[class^="metaSectionGroup"] div[class^=metaSectionContentBlock]:nth-of-type(2)');
  creatorDate = text('#instanceRecordMeta div[class^="metaSectionContent"] div[class^="metaSectionGroup"] div[class^=metaSectionContentBlock]:nth-of-type(1)');
});
