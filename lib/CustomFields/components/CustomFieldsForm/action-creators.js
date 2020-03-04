import * as actionTypes from './action-types';

export const addNewField = payload => ({ type: actionTypes.ADD_NEW_FIELD, payload });
export const updateCustomField = payload => ({ type: actionTypes.UPDATE_FIELD_VALUE, payload });
export const deleteCustomField = payload => ({ type: actionTypes.DELETE_CUSTOM_FIELD, payload });
export const cancelDelete = () => ({ type: actionTypes.CANCEL_DELETE });
export const resetFormValues = () => ({ type: actionTypes.RESET_FORM });
export const updateTitle = payload => ({ type: actionTypes.UPDATE_TITLE, payload });
