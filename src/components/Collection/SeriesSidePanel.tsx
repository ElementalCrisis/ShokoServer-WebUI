import React, { useState } from 'react';
import { mdiPencilCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import BackgroundImagePlaceholderDiv from '@/components/BackgroundImagePlaceholderDiv';
import EditSeriesModal from '@/components/Collection/Series/EditSeriesModal';
import SeriesInfo from '@/components/Collection/SeriesInfo';
import Button from '@/components/Input/Button';
import useEventCallback from '@/hooks/useEventCallback';
import useMainPoster from '@/hooks/useMainPoster';

import type { SeriesType } from '@/core/types/api/series';

type SeriesSidePanelProps = {
  series: SeriesType;
};

const SeriesSidePanel = ({ series }: SeriesSidePanelProps) => {
  const [showEditSeriesModal, setShowEditSeriesModal] = useState(false);
  const mainPoster = useMainPoster(series);

  const onClickHandler = useEventCallback(() => setShowEditSeriesModal(true));

  return (
    <div className="flex w-[28.125rem] flex-col gap-y-8 rounded-md border border-panel-border bg-panel-background-transparent p-8">
      <BackgroundImagePlaceholderDiv
        image={mainPoster}
        className="h-[33.125rem] w-[24.063rem] rounded drop-shadow-md"
      >
        {(series.AniDB?.Restricted ?? false) && (
          <div className="absolute bottom-0 left-0 flex w-full justify-center bg-panel-background-overlay py-1.5 text-sm font-semibold text-panel-text opacity-100 transition-opacity group-hover:opacity-0">
            18+ Adults Only
          </div>
        )}
      </BackgroundImagePlaceholderDiv>
      <Button buttonType="secondary" className="flex justify-center gap-x-2 px-5 py-2" onClick={onClickHandler}>
        <Icon path={mdiPencilCircleOutline} size={1} />
        Edit Series
      </Button>
      <SeriesInfo series={series} />
      <EditSeriesModal
        show={showEditSeriesModal}
        onClose={() => setShowEditSeriesModal(false)}
        seriesId={series.IDs.ID}
      />
    </div>
  );
};

export default SeriesSidePanel;