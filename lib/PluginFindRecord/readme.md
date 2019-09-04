# PluginFindRecord

## Introduction

To reduce copy-paste code in ui-plugin-find-* repos were created common components, PluginFindRecord and PluginFindRecordModal. They are based on ui-plugin-find-user code and use SearchAndSortQuery pattern instead of importing list components directly from repos (ui-users, ui-inventory, etc.).
Since we have a lot of such plugins (ui-plugin-find-contact, ui-plugin-find-interface, etc.) we've put that common code inside stripes-smart-components.

## Usage

The following code shows how use the component:
```javascript
const FindPOLine = ({ addLines, isSingleSelect, ...rest }) => (
  <PluginFindRecord
    {...rest}
    selectRecordsCb={addLines}
  >
    {(modalProps) => (
      <FindPOLineContainer>
        {(viewProps) => (
          <PluginFindRecordModal
            {...viewProps}
            {...modalProps}
            isMultiSelect={!isSingleSelect}
          />
        )}
      </FindPOLineContainer>
    )}
  </PluginFindRecord>
);
```
## Props of `PluginFindRecord`

| Name | Type | Description | Required | Default |
--- | --- | --- | --- | --- |
| `renderTrigger` | function | render function of plugin's button (replaces `searchLabel` and `disabled`) | No | |
| `selectRecordsCb` | function | Callback with selected array of records | No | `noop` |

### Trigger button props

If you don't use `renderTrigger` prop from above, you can provide some properties to the default plugin trigger button:

| Name | Type | Description | Required | Default |
--- | --- | --- | --- | --- |
| `disabled` | boolean | Flag to control `disabled` property of plugin's button, since it's rendered inside the plugin | No | `false` |
| `searchButtonStyle` | string | optional styling of plugin's button | No | `'primary'` |
| `searchLabel` | React.node | jsx or string for plugin's button label | No | `<Icon icon="search" color="#fff" />` |
| `marginBottom0` | boolean | Flag to control css style to remove bottom margin for trigger button | No | `true` |
| `marginTop0` | boolean | Flag to control css style to remove top margin for trigger button | No | `true` |

## Props of `PluginFindRecordModal`

| Name | Type | Description | Required | Default |
--- | --- | --- | --- | --- |
| `isMultiSelect` | boolean | show checkboxes and make possible to select multiple records in plugin | Yes | |
| `renderNewBtn` | function | render function to display button on the top of the results list, like `New` | No | `noop` |
