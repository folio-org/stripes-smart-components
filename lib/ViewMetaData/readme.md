# ViewMetaData component

## Introduction

`ViewMetaData` component fetches user data and renders `MetaSection` component with fetched data. Renders system user if user id is system id.

## Properties

| Property     | Type            | Description                                                                                            |
|--------------|-----------------|--------------------------------------------------------------------------------------------------------|
| `headingLevel`   | `number`   | Sets the heading level of the internal title (Only visible for screen readers). Must be a number between 1 and 6. |
| `metadata`   | `object`        | Object with user ids and dates.                                                                        |
| `systemId`   | `string`        | Property to determine if user is system. Optional property. If not passed system will not be rendered. |
| `systemUser` | `object | node` | Optional property. By default renders "System".                                                        |
| `children`   | `func`          | Optional property. The child function is provided an object with `lastUpdatedBy` so that presentation can be customized. If no child function is provided, `<ViewMetaData>` renders a `<MetaSection>` component.                                           |

## Usage

The following code shows how use the component:
```javascript
import { ViewMetaData } from '@folio/stripes-smart-components';

constructor(props) {
  // connect component via stripes so it becomes possible to fetch user data
  this.connectedViewMetaData = props.stripes.connect(ViewMetaData);
}

render() {
  return (
    <this.connectedViewMetaData
      metadata={metadata}
      systemId={systemId}
    />
  );
}
```
## Custom rendering using the child function

```javascript
import { ViewMetaData } from '@folio/stripes-smart-components';

  <ViewMetaData metadata={metadata}>
    { (lastUpdatedBy) => (<><strong>{lastUpdatedBy}</strong>- <span>{metadata.lastUpdatedDate}</span></>)
  </ViewMetaData>
```
