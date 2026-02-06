/**
 * 갤러리 그리드(매슨리) 반응형 열 개수
 * 키: max-width(px), 값: 열 개수
 */
export const MASONRY_BREAKPOINTS = { default: 5, 1280: 4, 1024: 3, 768: 2 };

/** width/height가 없을 때 카드에 사용할 기본 비율 */
export const DEFAULT_ASPECT_RATIO = "3/4";

/** 가상 스크롤 행 높이 추정값(px). 카드 높이 + mb-6(24px) 정도 */
export const VIRTUAL_ROW_HEIGHT = 320;
export const VIRTUAL_ROW_GAP = 24;

/** 가상 매슨리: 셀 간격(px), 뷰포트 밖 overscan(px) */
export const VIRTUAL_MASONRY_GAP = 24;
export const VIRTUAL_MASONRY_OVERSCAN_PX = 400;
