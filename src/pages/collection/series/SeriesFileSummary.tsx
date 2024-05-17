import React, { useState } from 'react';
import { useParams } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { toNumber } from 'lodash';

import FileMissingEpisodes from '@/components/Collection/Files/FilesMissingEpisodes';
import FileOverview from '@/components/Collection/Files/FilesOverview';
import FilesSummaryGroups from '@/components/Collection/Files/FilesSummaryGroup';
import Button from '@/components/Input/Button';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';

import type { WebuiSeriesFileSummaryType } from '@/core/types/api/webui';

type ModeType = 'Series' | 'Missing';

type FileSelectionHeaderProps = {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  fileSummary?: WebuiSeriesFileSummaryType;
};
const FilesSelectionHeader = React.memo(({ fileSummary, mode, setMode }: FileSelectionHeaderProps) => (
  <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
    <div className="flex gap-x-2 text-xl font-semibold">
      {mode}
      &nbsp;Files |
      {mode === 'Series'
        ? (
          <>
            <span className="text-panel-text-important">{fileSummary?.Groups.length ?? 0}</span>
            {fileSummary?.Groups?.length === 1 ? 'Entry' : 'Entries'}
          </>
        )
        : (
          <>
            <span className="text-panel-text-important">{fileSummary?.MissingEpisodes.length ?? 0}</span>
            {fileSummary?.MissingEpisodes?.length === 1 ? 'Entry' : 'Entries'}
          </>
        )}
    </div>
    <div className="flex items-center gap-x-1 text-xl font-semibold">
      {['Series', 'Missing'].map((key: ModeType) => (
        <Button
          className={cx(
            'w-[150px] rounded-lg ml-2 py-3 px-4 !font-normal',
            mode !== key
              ? 'bg-panel-toggle-background-alt text-panel-toggle-text-alt hover:bg-panel-toggle-background-hover'
              : '!bg-panel-toggle-background text-panel-toggle-text',
          )}
          key={key}
          onClick={() => setMode(key)}
        >
          {key}
          &nbsp;Files
        </Button>
      ))}
    </div>
  </div>
));

const SeriesFileSummary = () => {
  const { seriesId } = useParams();

  const [mode, setMode] = useState<ModeType>('Series');

  const { data: fileSummary, isFetching, isLoading } = useSeriesFileSummaryQuery(
    toNumber(seriesId!),
    { groupBy: 'GroupName,FileVersion,FileLocation,AudioLanguages,SubtitleLanguages,VideoResolution' },
    !!seriesId,
  );

  if (!seriesId) return null;

  return (
    <div className="flex w-full gap-x-6">
      <div className="flex flex-col gap-y-6">
        <FileOverview overview={fileSummary?.Overview} />
      </div>

      <div className="flex w-full flex-col gap-y-6">
        <FilesSelectionHeader
          mode={mode}
          setMode={setMode}
          fileSummary={fileSummary}
        />

        <div className="flex grow flex-col gap-y-6">
          {isLoading && (
            <div className="flex grow items-center justify-center text-panel-text-primary">
              <Icon path={mdiLoading} spin size={3} />
            </div>
          )}
          {mode === 'Series'
            ? <FilesSummaryGroups groups={fileSummary?.Groups} fetchingState={isFetching} />
            : <FileMissingEpisodes missingEps={fileSummary?.MissingEpisodes} />}
        </div>
      </div>
    </div>
  );
};

export default SeriesFileSummary;
