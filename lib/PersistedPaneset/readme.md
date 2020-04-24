# PersistedPaneset

Paneset with LocalStorage-backed persistence

## Description

`stripes-components` provides a `Paneset` component that supports drag-and-drop resizing of its child `Pane`s. This component saves those layout sizes to the client browser's `localStorage`.

## Example

```
<PersistedPaneset
  appId="@folio/agreements"
  id="agreements-paneset"
>
  // NB: The Pane's must all have IDs as well.
  //     This is a requirement for Pane's resizing functionality.
  <Pane id="left-pane">Foo</Pane>
  <Pane id="middle-pane">Baz</Pane>
  <Pane id="right-pane">Inga</Pane>
</PersistedPane>
```

### Properties

Name | Type | Required | Description
--- | --- | --- | ----
appId | string | Yes | The app ID that will be used for namespacing `localStorage`. Eg, `@folio/users`
id | string | Yes | The ID of the Paneset itself. This will be used for namespacing `localStorage`.
