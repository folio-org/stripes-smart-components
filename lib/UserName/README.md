# UserName

Retrieve a user record, then return its displayable name wrapped in `<span>`. Return "lastname, firstname", or "lastname", or "username" based on which values are provided and non-empty.

## Usage

```js
 import { useStripes } from '@folio/stripes/core';
 import { UserName } from '@folio/stripes/smart-components';

const Foo = ({ userId }) => {
  const { connect } = useStripes();
  const ConnectedUserName = connect(UserName);

  return <ConnectedUserName id={userId} />
}

export default Foo;
```

