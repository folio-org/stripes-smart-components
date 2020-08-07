# ClipCopy

Show a clipboard icon that copies text to the clipboard and displays a success toast

## Usage

```
import React from 'react';
import { ClipCopy } from '@folio/stripes/smart-components';
...
<>
  {item.barcode}
  <ClipCopy text={item.barcode} />
</>
```

## Properties

The following property is supported:

* `text`: the text to copy to the clipboard
