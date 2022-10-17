import React from 'react';
import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const QueryHarness = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

QueryHarness.propTypes = {
  children: PropTypes.node,
};

export default QueryHarness;
