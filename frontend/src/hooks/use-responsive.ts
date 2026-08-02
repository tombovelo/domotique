import { useWindowDimensions } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';

const REF_WIDTH = 375;
const MIN_GRID_ITEM = 160;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmall = width < 360;
  const isMedium = width >= 360 && width < 430;
  const isLarge = width >= 430;
  const pagePadding = isSmall ? 14 : 18;
  const contentMaxWidth = Math.min(MaxContentWidth, width - pagePadding * 2);
  const layoutWidth = contentMaxWidth;

  const gridGap = isSmall ? 10 : 12;
  const numGridColumns = Math.max(
    1,
    Math.min(4, Math.floor((layoutWidth + gridGap) / (MIN_GRID_ITEM + gridGap))),
  );
  const availableGridWidth = layoutWidth - gridGap * (numGridColumns - 1);
  const gridItemWidth = Math.floor(availableGridWidth / numGridColumns);

  const capped = Math.min(width / REF_WIDTH, 1.35);
  const scale = isSmall ? Math.max(width / REF_WIDTH, 0.85) : capped;
  const fontScale = Math.pow(scale, 0.5);

  function permCellWidth(cardPadding: number, gap: number, cols: number) {
    const avail = layoutWidth - cardPadding * 2 - gap * (cols - 1);
    return Math.floor(avail / cols);
  }

  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    pagePadding,
    contentMaxWidth,
    numGridColumns,
    gridItemWidth,
    gridGap,
    permCellWidth,
    isCompact: isSmall,
    scale,
    rs: (size: number) => Math.round(size * scale),
    rf: (size: number) => Math.round(size * fontScale),
  };
}
