import { interactor, property } from '@bigtest/interactor';

@interactor class ColumnsMenuCheckbox {
    isChecked = property('checked');
}

@interactor class ColumnsMenu {
    defaultScope = '[data-test-column-manager-menu]';

    checkbox = function checkbox(key) {
      return new ColumnsMenuCheckbox(`[data-test-column-manager-checkbox="${key}"]`);
    }
}

export default interactor(class ColumnManagerInteractor {
    columnsMenu = new ColumnsMenu();
});
