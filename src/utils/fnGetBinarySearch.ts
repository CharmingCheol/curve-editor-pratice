interface FnGetBinarySearch {
  collection: any[];
  index: number;
  key?: string;
}

/**
 * find와 findIndex의 속도 개선을 위해, 이진 탐색으로 targe index를 찾는 함수입니다.
 * key가 있을 경우 collection 배열에서 객체 key를 기준으로 탐색, 숫자 배열을 탐색 할 경우 key를 파라미터로 전달하지 않으면 됩니다.
 *
 * @param collection - 이진 탐색을 적용시킬 1차원 리스트
 * @param index - 찾고자 하는 index
 * @param key? - 찾고자 하는 key
 *
 * @returns 이진 탐색 index
 */

function fnGetBinarySearch({ collection, index, key }: FnGetBinarySearch) {
  const size = collection.length;
  let left = 0;
  let right = size - 1;

  if (key) {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (collection[mid][key] === index) {
        return mid;
      } else if (collection[mid][key] > index) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return -1;
  } else {
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (collection[mid] === index) {
        return mid;
      } else if (collection[mid] > index) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return -1;
  }
}

export default fnGetBinarySearch;
