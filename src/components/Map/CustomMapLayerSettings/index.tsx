import { Box, Stack } from '@mui/material';
import classNames from 'classnames';
import { useState } from 'react';

import { LAYER_SETTINGS_HEIGHT } from '@ncsa/geo-explorer/config';
import { useImplementation } from '@ncsa/geo-explorer/hooks/useImplementation';
import {
  AppDispatch,
  RootState,
  useDispatch,
  useSelector,
} from '@ncsa/geo-explorer/store';
import { toggleLayerSettings } from '@ncsa/geo-explorer/store/explore/slice';

export function MapLayerSettings() {
  const { Header, StyleSettings, TimeSelector, WFSFeatureTable } =
    useImplementation();

  const dispatch = useDispatch<AppDispatch>();
  const selectedLayer = useSelector((state: RootState) =>
    state.explore.mapLayers.find(
      (layer) => layer.data.layer_id === state.explore.selectedLayer,
    ),
  );
  const showLayerSettings = useSelector(
    (state: RootState) => state.explore.showLayerSettings,
  );

  const [styleSettingsOpen, setStyleSettingsOpen] = useState(false);

  if (!(selectedLayer && showLayerSettings)) return null;

  return (
    <>
      <Stack direction="column" className="w-full items-center">
        <Stack
          direction="column"
          className={classNames(
            'bg-white gap-[16px] px-[32px] py-[16px] box-border',
            'transform-none',
            'transition-[width,height] ease-out',
          )}
          sx={{
            width: '100%',
            height:
              selectedLayer.data.layer_type === 'raster'
                ? 'auto'
                : LAYER_SETTINGS_HEIGHT,
          }}
        >
          <Header
            onOpenStyleSettings={() => setStyleSettingsOpen(true)}
            onClose={() => {
              dispatch(toggleLayerSettings());
            }}
          />
          {selectedLayer.data.timestamps.length > 0 && <TimeSelector />}
          {selectedLayer.data.layer_type !== 'raster' ? (
            <Box className="flex-1 min-h-0 cursor-auto">
              <WFSFeatureTable dataset={selectedLayer.data} />
            </Box>
          ) : null}
        </Stack>
      </Stack>
      <StyleSettings
        open={styleSettingsOpen}
        onClose={() => setStyleSettingsOpen(false)}
      />
    </>
  );
}
