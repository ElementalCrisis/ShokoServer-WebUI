import React, { useEffect, useState } from 'react';
import { mdiArrowVerticalLock, mdiCogOutline, mdiFilterOutline, mdiLoading, mdiMagnify } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import { useLogsQuery } from '@/core/react-query/logs/queries';

const LogsPage = () => {
  const logLines = useLogsQuery().data;
  // TODO: Turn off scroll to bottom if user scrolls
  const [isScrollToBottom, setScrollToBottom] = useState(true);
  const [search, setSearch] = useState('');

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: logLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  // Magic code stolen from https://github.com/TanStack/virtual/issues/634
  // Fixes autoscroll issue in firefox
  if (parentRef.current) {
    rowVirtualizer.scrollRect = { height: parentRef.current.clientHeight, width: parentRef.current.clientWidth };
  }

  useEffect(() => {
    if (!isScrollToBottom || logLines.length === 0) return;
    rowVirtualizer.scrollToIndex(logLines.length - 1, { align: 'start' }); // 'start' scrolls to end and 'end' scrolls to start. ¯\_(ツ)_/¯
  }, [logLines.length, isScrollToBottom, rowVirtualizer]);

  return (
    <div className="flex grow flex-col gap-y-6">
      <div className="flex items-center justify-between rounded-lg border border-panel-border bg-panel-background p-6">
        <div className="text-xl font-semibold">Logs</div>
        <div className="flex items-center gap-x-2">
          <Input
            id="search"
            onChange={e => setSearch(e.target.value)}
            type="text"
            value={search}
            placeholder="Search Logs..."
            startIcon={mdiMagnify}
            className="w-80"
            disabled
          />
          <Button buttonType="secondary" buttonSize="normal" disabled>
            <Icon path={mdiFilterOutline} size={1} />
          </Button>
          <Button buttonType="secondary" buttonSize="normal" disabled>
            <Icon path={mdiCogOutline} size={1} />
          </Button>
          {/* TODO: To be moved into settings modal */}
          <Button
            buttonType="secondary"
            buttonSize="normal"
            className={cx(isScrollToBottom ? 'text-panel-text-primary' : '!text-panel-text')}
            onClick={() => setScrollToBottom(prev => !prev)}
          >
            <Icon path={mdiArrowVerticalLock} size={1} />
          </Button>
        </div>
      </div>

      <div className="flex grow rounded-lg border border-panel-border bg-panel-background p-6">
        <div
          className="w-full overflow-y-auto rounded-lg border-16 border-panel-input bg-panel-input contain-strict"
          ref={parentRef}
        >
          {logLines.length === 0
            ? (
              <div className="flex h-full items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} size={4} spin />
              </div>
            )
            : (
              <div
                className="relative w-full"
                style={{ height: rowVirtualizer.getTotalSize() }}
              >
                <div
                  className="absolute left-4 top-0 w-[95%]"
                  style={{ transform: `translateY(${virtualItems[0]?.start ?? 0}px)` }}
                >
                  {virtualItems.map((virtualRow) => {
                    const row = logLines[virtualRow.index];
                    return (
                      <div
                        className="mt-2 flex gap-x-6"
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                      >
                        <div className="w-44 shrink-0 opacity-65">{row.TimeStamp}</div>
                        <div className="w-[2.8rem] shrink-0">{row.Level}</div>
                        <div className="break-all">{row.Message}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
