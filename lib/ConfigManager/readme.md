# ConfigManager
Component used for persisting configuration settings.

## Description
The component handles saving new or updating existing configuration settings.

`<ConfigManager>` can use either [mod-configuration](https://github.com/folio-org/mod-configuration) or [mod-settings](https://github.com/folio-org/mod-settings) as its storage. To use the former, supply the `moduleName` props; to use the latter, supply the `scope` props.

At present, user-specific configuration is not supported: only tenant-wide configuration.

### Required Props
Name | type | description
--- | --- | ---
label | string | Title string for object-listing pane
configName | string | Name of the configuration property, e.g. "locale or "disabledTables". This is used as the `configName` field mod-configuration, and as the `key` field for mod-settings.
moduleName _or_ scope | string | Name of the module, e.g. "ORG", if mod-configuration is to be used; scope of the entry (e.g. "ui-ldp.admin") if mod-settings is to be used.
children | node | Content to be rendered inside the config-form: the actual form elements.

### Optional Props
Name | type | description
--- | --- | ---
calloutMessage | string | Optional string used to override default callout message after successful save.
configFormComponent | component | Optional form component to override the default `<ConfigForm>`.
getInitialValues | func | Optional function used to override default implementation.
onBeforeSave | func | Optional callback used before config has been saved to process form values.
onAfterSave | func | Optional callback used after config has been saved successfully.
formType | string | Optional specification of what form library to use. Default `redux-form`; the other supported value is `final-form`.
validate | func | Optional validation function for the form library.
userId | string | Optional user id for retrieving the user's own settings from mod-settings.
stripes | object | The stripes object: if provided, it is passed down into the child component of the config-form.
