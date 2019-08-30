import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import pickBy from 'lodash/pickBy';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Checkbox,
  Icon,
  Modal,
  MultiColumnList,
  Pane,
  PaneMenu,
  Paneset,
  SearchField,
} from '@folio/stripes-components';

import { SearchAndSortQuery } from '../SearchAndSort';
import NoResultsMessage from '../SearchAndSort/components/NoResultsMessage';
import FilterPaneToggle from '../SearchAndSort/components/SearchButton';
import Filters from './Filters';
import css from './PluginFindRecordModal.css';

const RESULTS_HEADER = <FormattedMessage id="stripes-smart-components.pfr.resultsHeader" />;

const reduceCheckedRecords = (records, isChecked = false) => {
  const recordsReducer = (accumulator, record) => {
    if (isChecked) {
      accumulator[record.id] = record;
    }

    return accumulator;
  };

  return records.reduce(recordsReducer, {});
};

class PluginFindRecordModal extends React.Component {
  state = {
    filterPaneIsVisible: true,
    checkedMap: {},
    isAllChecked: false,
  }

  toggleFilterPane = () => {
    this.setState(curState => ({
      filterPaneIsVisible: !curState.filterPaneIsVisible,
    }));
  }

  renderResultsFirstMenu(filters) {
    const { filterPaneIsVisible } = this.state;

    const filterCount = filters.string !== '' ? filters.string.split(',').length : 0;
    const hideOrShowMessageId = filterPaneIsVisible
      ? 'stripes-smart-components.hideSearchPane'
      : 'stripes-smart-components.showSearchPane';

    return (
      <PaneMenu>
        <FormattedMessage
          id="stripes-smart-components.numberOfFilters"
          values={{ count: filterCount }}
        >
          {appliedFiltersMessage => (
            <FormattedMessage id={hideOrShowMessageId}>
              {hideOrShowMessage => (
                <FilterPaneToggle
                  visible={filterPaneIsVisible}
                  aria-label={`${hideOrShowMessage} \n\n${appliedFiltersMessage}`}
                  onClick={this.toggleFilterPane}
                  badge={!filterPaneIsVisible && filterCount ? filterCount : undefined}
                />
              )}
            </FormattedMessage>
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  }

  saveMultiple = () => {
    const selectedRecords = Object.values(pickBy(this.state.checkedMap));

    this.props.onSaveMultiple(selectedRecords);
  };

  toggleAll = () => {
    this.setState((state, props) => {
      const isAllChecked = !state.isAllChecked;
      const { data: { records } } = props;
      const checkedMap = reduceCheckedRecords(records, isAllChecked);

      return {
        checkedMap,
        isAllChecked,
      };
    });
  }

  toggleRecord = toggledRecord => {
    const { id } = toggledRecord;

    this.setState((state, props) => {
      const { data: { records } } = props;
      const wasChecked = Boolean(state.checkedMap[id]);
      const checkedMap = { ...state.checkedMap };

      if (wasChecked) {
        delete checkedMap[id];
      } else {
        checkedMap[id] = toggledRecord;
      }
      const isAllChecked = records.every(record => Boolean(checkedMap[record.id]));

      return {
        checkedMap,
        isAllChecked,
      };
    });
  }

  saveMultiple = () => {
    const selectedRecords = Object.values(pickBy(this.state.checkedMap));

    this.props.onSaveMultiple(selectedRecords);
  };

  render() {
    const {
      closeModal,
      columnMapping,
      columnWidths,
      data,
      filterConfig,
      idPrefix,
      initialSearch,
      isMultiSelect,
      modalLabel,
      onComponentWillUnmount,
      onNeedMoreData,
      onSelectRow,
      queryGetter,
      querySetter,
      renderNewBtn,
      resultsFormatter,
      source,
      visibleColumns,
    } = this.props;
    const { checkedMap, isAllChecked } = this.state;

    const { records } = data;
    const checkedRecordsLength = Object.keys(checkedMap).length;
    const builtVisibleColumns = isMultiSelect ? ['isChecked', ...visibleColumns] : visibleColumns;

    const query = queryGetter ? queryGetter() || {} : {};
    const count = source ? source.totalCount() : 0;
    const sortOrder = query.sort || '';
    const resultsStatusMessage = source
      ? (
        <div data-test-find-records-no-results-message>
          <NoResultsMessage
            data-test-find-records-no-results-message
            source={source}
            searchTerm={query.query || ''}
            filterPaneIsVisible
            toggleFilterPane={noop}
          />
        </div>
      )
      : <FormattedMessage id="stripes-smart-components.pfr.noSourceYet" />;

    let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;

    if (source && source.loaded()) {
      resultPaneSub = <FormattedMessage id="stripes-smart-components.searchResultsCountHeader" values={{ count }} />;
    }

    const mixedResultsFormatter = {
      isChecked: record => (
        <Checkbox
          type="checkbox"
          checked={Boolean(checkedMap[record.id])}
          onChange={() => this.toggleRecord(record)}
        />
      ),
      ...resultsFormatter,
    };

    const footer = isMultiSelect && (
      <div className={css.pluginModalFooter}>
        <Button
          marginBottom0
          onClick={closeModal}
          className="left"
        >
          <FormattedMessage id="stripes-smart-components.pfr.button.close" />
        </Button>
        <div>
          <FormattedMessage
            id="stripes-smart-components.pfr.totalSelected"
            values={{ count: checkedRecordsLength }}
          />
        </div>
        <Button
          marginBottom0
          data-test-find-records-modal-save
          onClick={this.saveMultiple}
          disabled={!checkedRecordsLength}
          buttonStyle="primary"
        >
          <FormattedMessage id="stripes-smart-components.pfr.button.save" />
        </Button>
      </div>
    );

    return (
      <Modal
        data-test-find-records-modal
        dismissible
        enforceFocus={false}
        label={modalLabel}
        onClose={closeModal}
        open
        contentClass={css.pluginModalContent}
        style={{ minHeight: '500px' }}
        size="large"
        footer={footer}
      >
        <div className={css.pluginModalNewBtnWrapper}>
          {renderNewBtn()}
        </div>
        <div
          data-test-find-records
          className={isMultiSelect ? css.showButtonsBar : ''}
        >
          <SearchAndSortQuery
            querySetter={querySetter}
            queryGetter={queryGetter}
            onComponentWillUnmount={onComponentWillUnmount}
            initialSearch={initialSearch}
            initialSearchState={{ qindex: '', query: '' }}
            syncToLocationSearch={false}
          >
            {
              ({
                searchValue,
                getSearchHandlers,
                onSubmitSearch,
                onSort,
                getFilterHandlers,
                activeFilters,
                filterChanged,
                searchChanged,
                resetAll,
              }) => {
                const disableReset = () => {
                  if (filterChanged || searchChanged) {
                    return false;
                  }

                  return true;
                };

                return (
                  <Paneset id={`${idPrefix}-paneset`}>
                    {this.state.filterPaneIsVisible &&
                      <Pane
                        defaultWidth="22%"
                        paneTitle={<FormattedMessage id="stripes-smart-components.searchAndFilter" />}
                      >
                        <form onSubmit={onSubmitSearch}>
                          <div className={css.searchGroupWrap}>
                            <SearchField
                              autoFocus
                              className={css.searchField}
                              data-test-plugin-search-input
                              marginBottom0
                              name="query"
                              onChange={getSearchHandlers().query}
                              value={searchValue.query}
                            />
                            <Button
                              buttonStyle="primary"
                              data-test-plugin-search-submit
                              disabled={(!searchValue.query || searchValue.query === '')}
                              fullWidth
                              marginBottom0
                              type="submit"
                            >
                              <FormattedMessage id="stripes-smart-components.search" />
                            </Button>
                          </div>
                          <div className={css.resetButtonWrap}>
                            <Button
                              buttonStyle="none"
                              disabled={disableReset()}
                              fullWidth
                              id="clickable-reset-all"
                              onClick={resetAll}
                            >
                              <Icon icon="times-circle-solid">
                                <FormattedMessage id="stripes-smart-components.resetAll" />
                              </Icon>
                            </Button>
                          </div>
                          <Filters
                            activeFilters={activeFilters}
                            config={filterConfig}
                            onChangeHandlers={getFilterHandlers()}
                          />
                        </form>
                      </Pane>
                    }
                    <Pane
                      firstMenu={this.renderResultsFirstMenu(activeFilters)}
                      paneTitle={RESULTS_HEADER}
                      paneSub={resultPaneSub}
                      defaultWidth="fill"
                      padContent={false}
                    >
                      <MultiColumnList
                        visibleColumns={builtVisibleColumns}
                        contentData={records}
                        totalCount={count}
                        id="list-plugin-find-records"
                        columnMapping={{
                          isChecked: (
                            <Checkbox
                              checked={isAllChecked}
                              data-test-find-records-modal-select-all
                              onChange={this.toggleAll}
                              type="checkbox"
                            />
                          ),
                          ...columnMapping,

                        }}
                        formatter={mixedResultsFormatter}
                        onRowClick={!isMultiSelect && onSelectRow}
                        onNeedMoreData={onNeedMoreData}
                        onHeaderClick={onSort}
                        sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
                        sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
                        isEmptyMessage={resultsStatusMessage}
                        autosize
                        virtualize
                        columnWidths={columnWidths}
                      />
                    </Pane>
                  </Paneset>
                );
              }}
          </SearchAndSortQuery>
        </div>
      </Modal>
    );
  }
}

PluginFindRecordModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  columnMapping: PropTypes.object,
  columnWidths: PropTypes.object,
  data: PropTypes.object,
  filterConfig: PropTypes.arrayOf(PropTypes.object),
  idPrefix: PropTypes.string.isRequired,
  initialSearch: PropTypes.string,
  isMultiSelect: PropTypes.bool.isRequired,
  modalLabel: PropTypes.node,
  onComponentWillUnmount: PropTypes.func,
  onNeedMoreData: PropTypes.func,
  onSaveMultiple: PropTypes.func,
  onSelectRow: PropTypes.func,
  queryGetter: PropTypes.func,
  querySetter: PropTypes.func,
  renderNewBtn: PropTypes.func,
  resultsFormatter: PropTypes.object,
  source: PropTypes.object,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

PluginFindRecordModal.defaultProps = {
  columnMapping: {},
  columnWidths: {},
  data: {},
  filterConfig: [],
  initialSearch: '',
  modalLabel: '',
  onSaveMultiple: noop,
  renderNewBtn: noop,
  resultsFormatter: {},
};

export default PluginFindRecordModal;
