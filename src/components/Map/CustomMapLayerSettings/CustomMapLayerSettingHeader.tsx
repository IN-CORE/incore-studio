import {
  CloseOutlined,
  FileDownloadOutlined,
  PaletteOutlined,
  RemoveOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useContext } from 'react';

import { GeoExplorerContext } from '@ncsa/geo-explorer/GeoExplorerProvider';
import { DatasetDescriptionTooltip } from '@ncsa/geo-explorer/icons/DatasetDescriptionTooltip';
import {
  AppDispatch,
  RootState,
  useDispatch,
  useSelector,
} from '@ncsa/geo-explorer/store';
import { removeLayer } from '@ncsa/geo-explorer/store/explore/slice';

export type HeaderProps = {
  onOpenStyleSettings: () => void;
  onClose: () => void;
};

export function Header({ onOpenStyleSettings, onClose }: HeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { ogcClient } = useContext(GeoExplorerContext);

  const selectedLayer = useSelector((state: RootState) =>
    state.explore.mapLayers.find(
      (layer) => layer.data.layer_id === state.explore.selectedLayer,
    ),
  );

  if (!selectedLayer) return null;

  return (
    <Stack direction="row" className="select-none items-center">
      <Stack direction="column">
        <Stack direction="row" className="items-center">
          <Typography className="font-medium text-[16px]">
            {selectedLayer?.data.display_name}
          </Typography>
          <Tooltip title={selectedLayer?.data.description} placement="top">
            <Box className="ml-[6px] pointer-events-auto">
              <DatasetDescriptionTooltip />
            </Box>
          </Tooltip>
        </Stack>
      </Stack>
      <Box className="flex-1" />
      <Button
        variant="contained"
        disableElevation
        className="bg-[#2C343C]"
        startIcon={<RemoveOutlined />}
        onClick={() => {
          dispatch(removeLayer({ layer_id: selectedLayer.data.layer_id }));
        }}
      >
        Remove
      </Button>
      <IconButton
        disabled={selectedLayer.data.layer_type === 'raster'}
        onClick={() => {
          ogcClient?.downloadDataset(selectedLayer.data);
        }}
      >
        <FileDownloadOutlined />
      </IconButton>
      <IconButton onClick={onOpenStyleSettings}>
        <PaletteOutlined />
      </IconButton>
      <IconButton onClick={onClose}>
        <CloseOutlined />
      </IconButton>
    </Stack>
  );
}
