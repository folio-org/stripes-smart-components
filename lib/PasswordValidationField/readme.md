# Password Validation Field

## Introduction

Password validation component provides validation feature for user password based on
validation rules retrieved from backend in a form of regular expressions.

## Usage

The following code shows how use the component:
```javascript
import { PasswordValidationField } from '@folio/stripes-smart-components';

constructor() {
  // connect component via stripes so it becomes possible to load validation rules from backend
  this.passwordField = props.stripes.connect(PasswordValidationField);
}

render() {
  return (
    <form>
      ...
      <this.passwordField
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
