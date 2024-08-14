# ControlledVocab

## Description

Component designed to manage a controlled vocabulary list. This list consists of predefined terms or keywords that users can interact with by adding, editing, or removing entries.

## Props

Name | Type | Default | Description
--- | --- | --- | ---
actionProps | Object | | placeholder
actionSupressor | Object | `{edit: item: => item.readOnly, delete: item, => item.readOnly}` | placeholder
actuatorType | String | `'rest'` | placeholder
baseUrl | String | | placeholder
canCreate | Boolean | `true` | placeholder
clientGeneratePk | Bool/String | `true` | placeholder
columnMapping | Object | | placeholder
editable | Boolean | `true` | placeholder
formatter | Object | | placeholder
hiddenFields | Array of Strings | | placeholder
hideCreateButton | Boolean | `false` | placeholder
id | String | | placeholder
itemTemplate | Object | | placeholder
label | ReactNode | | placeholder
limitParam | String | | placeholder
listFormLabel | ReactNode | | placeholder
listSupressor | Function | | placeholder
listSupressorText | ReactNode | | placeholder
nameKey | String | `undefined` | placeholder
objectLabel | ReactNode | | placeholder
parseRows | Function | | placeholder
preCreateHook | Function | `(row) => row` | placeholder
preUpdateHook | Function | `(row) => row` | placeholder
readOnlyFields | Array of Strings | | placeholder
records | String | | placeholder
rowFilter | Element | | placeholder
rowFilterFunction | Function | | placeholder
sortBy | String | | placeholder
translations | Object | | placeholder