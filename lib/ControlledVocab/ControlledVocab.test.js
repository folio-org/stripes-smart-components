import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';

import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { IconButton, MultiColumnList, TextField } from '@folio/stripes-components';
import { useOkapiKy } from '@folio/stripes-core';

import ControlledVocab from './ControlledVocab';

// the global MCL mock renders nothing; render cells via the real formatters
MultiColumnList.mockImplementation(({ contentData, visibleColumns, formatter }) => (
  <table>
    <tbody>
      {contentData.map(item => (
        <tr key={item.id}>
          {visibleColumns.map(c => <td key={c}>{formatter[c] ? formatter[c](item) : item[c]}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
));

// the global IconButton mock drops `disabled` and `data-testid` onto a span
IconButton.mockImplementation(({ onClick, disabled, 'data-testid': testId }) => (
  <button type="button" data-testid={testId} disabled={disabled} onClick={onClick} />
));

// the global TextField mock expects a final-form `input` prop
TextField.mockImplementation(({ value, onChange, error, 'data-testid': testId, 'aria-label': ariaLabel }) => (
  <div>
    <input data-testid={testId} aria-label={ariaLabel} value={value} onChange={onChange} />
    {error}
  </div>
));

const groups = [
  { id: 'a', name: 'alpha', description: 'first' },
  { id: 'b', name: 'beta', description: 'second', readOnly: true },
];

const ky = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};
const resolved = (v) => ({ json: () => Promise.resolve(v) });

const renderCV = (props = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ControlledVocab
          baseUrl="groups"
          records="usergroups"
          label="Groups"
          labelSingular="Group"
          objectLabel="Users"
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ControlledVocab', () => {
  beforeEach(() => {
    ky.get.mockImplementation(() => resolved({ usergroups: groups }));
    ky.post.mockImplementation(() => resolved({}));
    ky.put.mockImplementation(() => resolved({}));
    ky.delete.mockResolvedValue({});
    useOkapiKy.mockReturnValue(ky);
  });

  afterEach(() => jest.clearAllMocks());

  it('fetches and lists values, honoring the sort and limit params', async () => {
    renderCV({ sortby: 'name', limitParam: 'perPage' });

    expect(await screen.findByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
    expect(ky.get).toHaveBeenCalledWith('groups', expect.objectContaining({
      searchParams: { query: 'cql.allRecords=1 sortby name', perPage: 2000 },
    }));
  });

  it('suppresses actions on readOnly rows', async () => {
    renderCV();
    await screen.findByText('alpha');

    expect(screen.getByTestId('edit-a')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-b')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-b')).not.toBeInTheDocument();
  });

  it('applies rowFilterFunction and parseRow', async () => {
    renderCV({
      rowFilterFunction: r => r.id === 'a',
      parseRow: r => ({ ...r, name: r.name.toUpperCase() }),
    });

    expect(await screen.findByText('ALPHA')).toBeInTheDocument();
    expect(screen.queryByText('beta')).not.toBeInTheDocument();
  });

  it('creates a value with a generated id and the preCreateHook applied', async () => {
    const preCreateHook = jest.fn(r => ({ ...r, extra: true }));
    renderCV({ preCreateHook });
    await screen.findByText('alpha');

    await userEvent.click(screen.getByText('stripes-core.button.new'));
    await userEvent.type(screen.getByTestId('field-name'), 'gamma');
    await userEvent.click(screen.getByText('stripes-core.button.save'));

    await waitFor(() => expect(ky.post).toHaveBeenCalled());
    expect(ky.post).toHaveBeenCalledWith('groups', {
      json: expect.objectContaining({ name: 'gamma', extra: true, id: expect.any(String) }),
    });
  });

  it('does not save a row with an empty primary field', async () => {
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByText('stripes-core.button.new'));
    await userEvent.click(screen.getByText('stripes-core.button.save'));

    expect(await screen.findByText('stripes-core.label.missingRequiredField')).toBeInTheDocument();
    expect(ky.post).not.toHaveBeenCalled();
  });

  it('shows errors from the validate prop', async () => {
    renderCV({ validate: () => ({ description: 'bad description' }) });
    await screen.findByText('alpha');

    await userEvent.click(screen.getByText('stripes-core.button.new'));
    await userEvent.type(screen.getByTestId('field-name'), 'gamma');
    await userEvent.click(screen.getByText('stripes-core.button.save'));

    expect(ky.post).not.toHaveBeenCalled();
    expect(screen.getByText('bad description')).toBeInTheDocument();
  });

  it('updates a value', async () => {
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('edit-a'));
    await userEvent.type(screen.getByTestId('field-name'), '2');
    await userEvent.click(screen.getByText('stripes-core.button.save'));

    await waitFor(() => expect(ky.put).toHaveBeenCalled());
    expect(ky.put).toHaveBeenCalledWith('groups/a', {
      json: expect.objectContaining({ id: 'a', name: 'alpha2' }),
    });
  });

  it('cancels editing without saving', async () => {
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('edit-a'));
    await userEvent.click(screen.getByText('stripes-core.button.cancel'));

    expect(screen.queryByTestId('field-name')).not.toBeInTheDocument();
    expect(ky.put).not.toHaveBeenCalled();
  });

  it('deletes a value after confirmation', async () => {
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('delete-a'));
    await userEvent.click(screen.getByText('confirm'));

    await waitFor(() => expect(ky.delete).toHaveBeenCalledWith('groups/a'));
  });

  it('disables Save while the save request is pending', async () => {
    let finish;
    ky.put.mockReturnValue(new Promise(r => { finish = r; }));
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('edit-a'));
    await userEvent.click(screen.getByText('stripes-core.button.save'));

    await waitFor(() => expect(screen.getByText('stripes-core.button.save').closest('button')).toBeDisabled());
    expect(ky.put).toHaveBeenCalledTimes(1);

    finish({});
    await waitFor(() => expect(screen.queryByTestId('field-name')).not.toBeInTheDocument());
  });

  it('disables delete buttons while the delete request is pending', async () => {
    let finish;
    ky.delete.mockReturnValue(new Promise(r => { finish = r; }));
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('delete-a'));
    await userEvent.click(screen.getByText('confirm'));

    await waitFor(() => expect(screen.getByTestId('delete-a')).toBeDisabled());
    expect(ky.delete).toHaveBeenCalledTimes(1);

    finish({});
    await waitFor(() => expect(screen.getByTestId('delete-a')).not.toBeDisabled());
  });

  it('shows the in-use dialog when delete fails', async () => {
    ky.delete.mockRejectedValue(new Error('in use'));
    renderCV();
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('delete-a'));
    await userEvent.click(screen.getByText('confirm'));

    expect(await screen.findByText('stripes-smart-components.cv.cannotDeleteTermMessage')).toBeInTheDocument();
  });

  it('PUTs { values } to baseUrl for actuatorType="refdata"', async () => {
    renderCV({ actuatorType: 'refdata' });
    await screen.findByText('alpha');

    await userEvent.click(screen.getByTestId('delete-a'));
    await userEvent.click(screen.getByText('confirm'));

    await waitFor(() => expect(ky.put).toHaveBeenCalledWith('groups', {
      json: { values: [{ id: 'a', _delete: true }] },
    }));
  });

  it('hides the create button when asked', async () => {
    renderCV({ hideCreateButton: true });
    await screen.findByText('alpha');

    expect(screen.queryByText('stripes-core.button.new')).not.toBeInTheDocument();
  });

  it('shows listSuppressorText instead of the list', async () => {
    renderCV({ listSuppressor: () => true, listSuppressorText: 'nothing here' });

    expect(screen.getByText('nothing here')).toBeInTheDocument();
    expect(screen.queryByText('alpha')).not.toBeInTheDocument();
  });

  it('looks up the users who last updated values, once each', async () => {
    const metadata = { updatedByUserId: 'u1', updatedDate: '2024-01-01' };
    ky.get.mockImplementation((path) => (path === 'users' ?
      resolved({ users: [] }) :
      resolved({ usergroups: [{ id: 'a', name: 'alpha', metadata }, { id: 'b', name: 'beta', metadata }] })));
    renderCV();

    await waitFor(() => expect(ky.get).toHaveBeenCalledWith('users', expect.objectContaining({
      searchParams: expect.objectContaining({ query: 'id=="u1"' }),
    })));
  });
});
