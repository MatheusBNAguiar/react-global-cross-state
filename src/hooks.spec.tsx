import React, { useEffect, useRef } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { createGlobalStore, useGlobalStore, useSetGlobalStore } from './hooks';

const useCommitCount = () => {
  const commitCountRef = useRef(1);
  useEffect(() => {
    commitCountRef.current += 1;
  });
  return commitCountRef.current;
};

it('useSetGlobalStore does not trigger rerender in component', async () => {
  const globalStore = createGlobalStore(0);

  const Displayer = () => {
    const [count] = useGlobalStore(globalStore);
    const commits = useCommitCount();
    return (
      <div>
        count: {count}, commits: {commits}
      </div>
    );
  };

  const Updater = () => {
    const setCount = useSetGlobalStore(globalStore);
    const commits = useCommitCount();

    return (
      <>
        <button onClick={() => setCount(count => count + 1)}>increment</button>
        <div>updater commits: {commits}</div>
      </>
    );
  };

  const { getByText } = render(
    <>
      <Displayer />
      <Updater />
    </>,
  );

  await waitFor(() => {
    getByText('count: 0, commits: 1');
    getByText('updater commits: 1');
  });
  fireEvent.click(getByText('increment'));
  await waitFor(() => {
    getByText('count: 1, commits: 2');
    getByText('updater commits: 1');
  });
  fireEvent.click(getByText('increment'));
  await waitFor(() => {
    getByText('count: 2, commits: 3');
    getByText('updater commits: 1');
  });
  fireEvent.click(getByText('increment'));
  await waitFor(() => {
    getByText('count: 3, commits: 4');
    getByText('updater commits: 1');
  });
});

it('useGlobalStore does trigger globally', async () => {
  const globalStore = createGlobalStore(0);

  const Displayer1 = () => {
    const [count] = useGlobalStore(globalStore);
    const commits = useCommitCount();
    return (
      <div>
        count: {count}, commits: {commits}
      </div>
    );
  };

  const DisplayerUpdater = () => {
    const [count, setCount] = useGlobalStore(globalStore);
    const commits = useCommitCount();
    return (
      <div>
        <button onClick={() => setCount(count => count + 1)}>increment displayer updater</button>
        count: {count}, displayer updater commits: {commits}
      </div>
    );
  };

  const Updater = () => {
    const setCount = useSetGlobalStore(globalStore);
    const commits = useCommitCount();

    return (
      <>
        <button onClick={() => setCount(count => count + 1)}>increment</button>
        <div>updater commits: {commits}</div>
      </>
    );
  };

  const { getByText } = render(
    <>
      <Displayer1 />
      <DisplayerUpdater />
      <Updater />
    </>,
  );

  await waitFor(() => {
    getByText('count: 0, commits: 1');
    getByText('count: 0, displayer updater commits: 1');
    getByText('updater commits: 1');
  });
  fireEvent.click(getByText('increment'));
  await waitFor(() => {
    getByText('count: 1, commits: 2');
    getByText('count: 1, displayer updater commits: 2');
    getByText('updater commits: 1');
  });
  fireEvent.click(getByText('increment displayer updater'));
  await waitFor(() => {
    getByText('count: 2, commits: 3');
    getByText('count: 2, displayer updater commits: 3');
    getByText('updater commits: 1');
  });
});
