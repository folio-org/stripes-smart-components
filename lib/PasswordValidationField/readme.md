# Password Validation Field

## Introduction

Password validation component provides validation feature for user password based on
validation rules retrieved from backend in a form of regular expressions.

## Usage

The following code shows how use the component:
```javascript
import { PasswordValidationField } from '@folio/stripes-smart-components';

render() {
  return (
    <form>
      ...
      <PasswordValidationField
        id="new-password"
        name="newPassword"
        label="Label"
        username="diku_admin"
      />
      ...
    </form>
  );
}
```
