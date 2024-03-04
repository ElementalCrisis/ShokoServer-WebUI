import React, { useCallback, useMemo, useRef } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import ListViewItem from '@/components/Collection/ListViewItem';
import PosterViewItem from '@/components/Collection/PosterViewItem';
import { listItemSize, posterItemSize } from '@/components/Collection/constants';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';
import type { WebuiGroupExtra } from '@/core/types/api/webui';

type Props = {
  groupExtras: WebuiGroupExtra[];
  fetchNextPage: () => Promise<unknown>;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  isSeries: boolean;
  isSidebarOpen: boolean;
  items: CollectionGroupType[] | SeriesType[];
  mode: string;
  total: number;
};

const CollectionView = (props: Props) => {
  const {
    fetchNextPage,
    groupExtras,
    isFetching,
    isFetchingNextPage,
    isSeries,
    isSidebarOpen,
    items,
    mode,
    total,
  } = props;

  const [itemWidth, itemHeight] = useMemo(() => {
    if (mode === 'poster') return [posterItemSize.width, posterItemSize.height];
    return [
      (isSeries || isSidebarOpen) ? listItemSize.widthAlt : listItemSize.width,
      listItemSize.height,
    ];
  }, [isSidebarOpen, mode, isSeries]);

  const observer = useRef<IntersectionObserver>();
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage().catch(() => {});
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, isFetchingNextPage],
  );

  const renderItem = useCallback(
    (item: CollectionGroupType | SeriesType, index: number) => {
      const isLastItem = index === items.length - 1;
      const baseStyle = { width: `${itemWidth}px`, height: `${itemHeight}px` };

      const key = `group-${item?.IDs.ID || index}`;

      const renderContent = () => {
        if (!item) {
          return <Icon path={mdiLoading} spin size={1} />;
        }
        if (mode === 'poster') {
          return <PosterViewItem item={item} isSeries={isSeries} />;
        }
        const groupExtra = !isSeries ? groupExtras.find(extra => extra.ID === item.IDs.ID) : undefined;
        return (
          <ListViewItem
            item={item}
            groupExtras={groupExtra}
            isSeries={isSeries}
            isSidebarOpen={isSidebarOpen}
          />
        );
      };

      if (isLastItem) {
        return (
          <div ref={lastItemRef} style={baseStyle} key={key}>
            {renderContent()}
          </div>
        );
      }

      return (
        <div style={baseStyle} key={key}>
          {renderContent()}
        </div>
      );
    },
    [items, mode, itemWidth, itemHeight, isSeries, groupExtras, isSidebarOpen, lastItemRef],
  );

  if (total === 0) {
    return (
      <div
        className={cx(
          'flex grow rounded-lg items-center font-semibold justify-center max-h-screen',
          mode === 'poster' && 'px-6 py-6 bg-panel-background border-panel-border border',
        )}
      >
        <div className="flex w-full justify-center">
          {isFetching
            ? <Icon path={mdiLoading} size={3} className="text-panel-text-primary" spin />
            : 'No series/groups available!'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        'flex flex-wrap gap-x-6 gap-y-6 grow rounded-lg',
        mode === 'poster' ? 'px-6 py-6 bg-panel-background border-panel-border border w-min' : '',
      )}
    >
      {items.map(renderItem)}
    </div>
  );
};

export default CollectionView;
