# Password Strength

## Introduction

It is POC for password strength component. It requies additional styling, 
tests and configuration in order to be completed.

## Usage

Include plugin via 
`<PasswordStrength dataSource={DATA_STRING}></PasswordStrength>`


The following code shows how to pass value to plugin.
```javascript
import { formValues } from 'redux-form';

getCurrentValues(key) {
        const {stripes: {store}} = this.props;
        const state = store.getState();
        const values = getFormValues('Form')(state) || {};
        return values[key] || false;
}

<PasswordStrength type="password-strength" dataSource={this.getCurrentValues("InputName")}>
</PasswordStrength>
```