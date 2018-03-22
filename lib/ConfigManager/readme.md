# ConfigManager
Component used for persisting configuration settings.

## Description
The component handles saving new or updating existing configuration settings.

### Required Props
Name | type | description
--- | --- | ---
label | string | Title string for object-listing pane
configName | string | Name of the configuration property, e.g. "locale"
moduleName | string | Name of the module, e.g. "ORG"

### Optional Props
Name | type | description
--- | --- | ---
calloutMessage | string | Optional string used to override default callout message after successful save.
configFormComponent | component | Optional form component to override the default `<ConfigForm>`.
getInitialValues | func | Optional function used to override default implementation.
onBeforeSave | func | Optional callback used before config has been saved to process form values.
onAfterSave | func | Optional callback used after config has been saved successfully.
