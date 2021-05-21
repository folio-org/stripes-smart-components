export const MAX_TITLE_LENGTH = 255;
export const NOTES_PATH = 'notes';
export const DETAILS_CUTOFF_LENGTH = 255;

export const notesStatuses = {
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  ALL: 'all',
};

export const sortOrders = {
  ASC: 'asc',
  DESC: 'desc',
};

export const NOTE_LINKS_MIN_NUMBER = 1;

const assigningModalColumnNames = {
  ASSIGNING: 'assigning',
  TITLE: 'title',
  STATUS: 'status',
  COUNT: 'linksNumber',
};

export const assigningModalColumnsConfig = {
  names: assigningModalColumnNames,
  widths: {
    [assigningModalColumnNames.ASSIGNING]: '5%',
    [assigningModalColumnNames.COUNT]: '25%',
    [assigningModalColumnNames.TITLE]: '50%',
    [assigningModalColumnNames.STATUS]: '20%',
  },
};

export const notesColumnNames = {
  DATE: 'date',
  TITLE_AND_DETAILS: 'titleAndDetails',
  TYPE: 'type',
};

export const notesColumnsWidth = {
  [notesColumnNames.DATE]: '20%',
  [notesColumnNames.TITLE_AND_DETAILS]: '60%',
  [notesColumnNames.TYPE]: '20%',
};

export const SESSION_STORAGE_KEY_PREFIX = 'popUpNoteInfo';
