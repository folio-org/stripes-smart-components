# ColumnManager
A render-prop component for implementing toggleable columns in e.g. a `<MultiColumnList>`.

## How it works
The `<ColumnManager>` accepts a `columnMapping`-object that maps keys to labels and returns an array of visible columns through a render-prop function.

The UI for rendering a `<MenuSection>` with a set of checkboxes is passed down as well, which makes it straightforward to implement a dropdown menu for toggling columns.

The required ID passed to `<ColumnManager>` is used to persist the user's selected columns in sessionStorage.

## Basic Usage
```js
    import { ColumnManager } from '@stripes/folio/smart-components';

    const columnMapping = {
        status: 'Status',
        name: 'Name',
        barcode: 'Barcode',
        username: 'Username',
        email: 'Email'
    };

    <ColumnManager
        id="users-list-columns" // Required
        columnMapping={columnMapping} // Required
        excludeKeys={['name']} // Exclude these keys from being toggleable
    >
        {({ visibleColumns, renderColumnsMenu, toggleColumn }) => {
            // Render UI
        }}
    </ColumnManager>
```

## Advanced Usage
A typical use-case for the `<ColumnManager>` is the implementation of toggleable columns in a results view.

In the example below, we wrap the `<ColumnManager>` around the results pane and pass down the columns menu UI to the `<Pane>` -> `actionMenu`-prop and the `visibleColumns` is passed to the `<MultiColumnList>`.

```js
    import { ColumnManager } from '@folio/stripes/smart-components';
     import { Pane, MultiColumnList } from '@folio/stripes/components';

    const columnMapping = {
        status: 'Status',
        name: 'Name',
        barcode: 'Barcode',
        username: 'Username',
        email: 'Email'
    }

    const renderPane = ({ visibleColumns, renderColumnsMenu }) => {
        const actionMenu = () => (
            <>
                {/* Other menu sections */}
                {renderColumnsMenu}
            </>
        );

        return (
            <Pane
                id="users-search-results-pane"
                firstMenu={actionMenu}
                ...
            >
                <MultiColumnList
                    id="list-users"
                    visibleColumns={visibleColumns}
                    ...
                />
            </Pane>
        );
    }

    <ColumnManager
        id="users-list-columns"
        columnMapping={columnMapping}
    >
        {renderPane}
    </ColumnManager>
```

## Render Props
A set of useful props is passed down to the render-prop function

Prop | Description
--- | ---
visibleColumns | An array of visible column keys that can be passed directly down to the `<MultiColumnList>`
renderColumnsMenu | Renders a `<MenuSection>` with `<Checkboxes>` for toggling columns. This makes it easy to implement dropdown menu for toggling columns
toggleColumn | A method that toggles the visiblity for a given column – e.g. toggleColumn('email')

## Prop Types
Name | Type | Description | Default | Required
--- | --- | --- | --- | --- |
children | func | The render-prop function that will receive the relevant props for implementing toggleable columns | | ☑️
columnMapping | object | An object that maps keys to labels. The order of the keys will determine the default order of the columns. | | ☑️
excludeKeys | array | Exclude some columns from being toggleable. These keys will be excluded from the columns menu UI. | | 
id | string | The unique ID is used to generate the storage key for persisting the visible columns in sessionStorage. The ID will also be used as a prefixed ID for any UI that is passed down to the render-prop function. | | ☑️