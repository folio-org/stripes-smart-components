# DateRangeFilter

## Props

| name | type | description | required | default
| -- | -- | -- | -- | --
| `dateFormat` | string | String format of date input | false | 'YYYY-MM-DD'
| `placement` | string | Requested placement position for the calendar overlay. | false | 'right-start',
| `name` | string | Passed to the `onChange` handler for the filtering field that should be affected. | true |
| `selectedValues` | shape { endDate, startDate } | Sets the values of the Datepickers. | true | |
| `makeFilterString` | func (startDate, endDate) | Function that should convert the start and end values to a filter-compatible string. | true |
| `onChange` | func | Change handler. | true |
| `focusRef` | ref | Ref for external focus management. Calling `ref.focus()` will send browser focus to the start Datepicker. | false |
| `requiredFields` | string[] | Set which fields for this filter are requred. See #Validation for more details on the behavior. | true |  `[DATE_TYPES.START, DATE_TYPES.END]`
| `startLabel` | string | Will be set as the `aria-label` on the range start field. | false |
| `endLabel` | string | Will be set as the `aria-label` on the range end field. | false |
| `hideCalendarButton` | bool | Hide calenber icon button. | false |
| `ignoreDatesOrder` | bool | Ignore order of dates during validation | false |

## Validation

The default `requiredFields` prop, `[DATE_TYPES.START, DATE_TYPES.END]` sets the requirement that both the start and end fields are filled out when the 'Apply' button is pressed, otherwise a validation error message is relayed to the user. Setting `requiredFields` to only contain either `DATE_TYPES.START` or `DATE_TYPES.END` will limit the requirement to only that corresponding field. Supplying An empty array will require neither field. In any case, the supplied `makeFilterString` function should be set up to handle the possible empty values and adjust the filter string accordingly.

```
// requiredFieldsProp: [`DATE_TYPES.START`]

// makeFilter string outputs "<startDate>:<endDate>" if both are present,
// "<startDate>" if only startDate is provided.

const makeFilterString(startDate, endDate) => {
  const makeFilterString = (startDate, endDate) => {
    return `${startDate}${endDate ? ':' + endDate : ''}`;
  };
}
```

## Accessible labeling

The `startLabel` and `endLabel` props should be used to differentiate each date range filter from those of other date range filter instances. The labeling defaults to generic labeling ex "from" and "to" but this should be made more specific at the app level i.e. "earliest" and "end of subscription range."