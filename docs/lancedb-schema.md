# LanceDB 스키마 (images 테이블)

Next 쪽에서 Python/LanceDB API와 계약을 맞출 때 참고하는 스키마 정의입니다.

## 테이블 이름

`images`

## 컬럼 정의

| 컬럼 | 타입 | 필수 | 비고 |
|------|------|------|------|
| id | string | O | 이미지 고유 ID (기존과 동일) |
| filename | string | O | 예: `1769805416285.webp` |
| thumbnail | string | O | 예: `1769805416285.webp` |
| originalName | string | O | 업로드 시 파일명 |
| tags | list[string] | O | WD14 태그 배열, 빈 배열 가능 |
| width | int | X | 원본 너비 |
| height | int | X | 원본 높이 |
| notes | string | O | 빈 문자열 가능 |
| createdAt | string | O | ISO 8601 (예: `2026-01-30T20:37:10.690Z`) |
| **vector** | **float32[N]** | O | 이미지 임베딩 벡터 (차원 N은 임베딩 모델에 따름) |

- **vector**만 새로 추가되는 컬럼이며, 나머지는 기존 JSON / `ImageItem`과 1:1 대응합니다.
- 벡터 차원 N: 임베딩 모델 선택 후 결정. 예: CLIP ViT-B/32 → 512, ViT-L/14 → 768. 현재 Python 스키마 기본값은 512이며, 마이그레이션 시 변경 가능합니다.

## Python 스키마 위치

- [server/schema.py](../server/schema.py): Pydantic `LanceModel` 클래스 `ImageRow` 및 `VECTOR_DIM` 상수.
