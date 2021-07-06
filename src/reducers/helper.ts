import dummy from "../dummy.json";

const curveEditorDataHelper = () => {
  return dummy.baseLayer.slice(0, 12).map((data) => {
    const x: [number, number][] = [];
    const y: [number, number][] = [];
    const z: [number, number][] = [];
    data.values?.forEach((value, index) => {
      const remainder = index % 3;
      const timeIndex = ((index / 3) | 0) + 1;
      switch (remainder) {
        case 0: {
          x.push([timeIndex, value]);
          break;
        }
        case 1: {
          y.push([timeIndex, value]);
          break;
        }
        case 2: {
          z.push([timeIndex, value]);
          break;
        }
        default: {
          break;
        }
      }
    });
    return {
      interpolation: data.interpolation,
      isIncluded: data.isIncluded,
      name: data.name,
      x,
      y,
      z,
    };
  });
};

export default curveEditorDataHelper;
