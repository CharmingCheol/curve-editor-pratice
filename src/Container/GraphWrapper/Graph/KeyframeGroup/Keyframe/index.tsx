import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  FunctionComponent,
} from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "reducers";
import * as curveEditor from "actions/curveEditor";
import { ClickedTarget } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface Props {
  data: number[];
  trackName: string;
  xyzType: "x" | "y" | "z";
  keyframeIndex: number;
  lineIndex: number;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { data, keyframeIndex, lineIndex, trackName, xyzType } = props;
  const circlePosition = useRef({ circleX: 0, circleY: 0 });
  const keyframeRef = useRef<SVGGElement>(null);
  const isAlreadySelected = useRef(false);
  const dispatch = useDispatch();

  const [circleTranslateXY, setCircleTranslateXY] = useState({ x: 0, y: 0 });
  const [clicked, setSelected] = useState(false);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const clickedTarget: ClickedTarget = {
        targetType: "keyframe",
        trackName,
        xyzType,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
        coordinates: { x: data[0], y: data[1] },
      };
      dispatch(
        curveEditor.changeClickedTarget({
          clickedTarget,
        })
      );
    },
    [data, dispatch, trackName, xyzType]
  );

  // 옵저버에 선택 된 키프레임 추가
  const registerKeyframeObserver = useCallback(() => {
    Observer.registerKeyframe({
      active: ({ x, y }) => {
        const { circleX, circleY } = circlePosition.current;
        const invertScaleX = Scale.getScaleX().invert;
        const invertScaleY = Scale.getScaleY().invert;
        const timeIndex = Math.round(invertScaleX(circleX + x));
        const value = invertScaleY(circleY + y);
        setCircleTranslateXY({ x, y });
        return { lineIndex, keyframeIndex, trackName, timeIndex, value };
      },
    });
  }, [keyframeIndex, lineIndex, trackName]);

  // 키프레임 드래그, 드래그 종료
  useDragCurveEditor({
    onDragging: ({ cursorGap }) => {
      Observer.notifyKeyframes({ cursorGap, dragType: "dragging" });
    },
    onDragEnd: ({ cursorGap }) => {
      const keyframes = Observer.notifyKeyframes({
        cursorGap,
        dragType: "dragend",
      });
      if (keyframes) {
        dispatch(curveEditor.updateCurveEditorByKeyframe({ keyframes }));
      }
    },
    ref: keyframeRef,
  });

  // 다른 curve line이나 keyframe 클릭 시, 선택 유지 및 해제 적용
  useEffect(() => {
    if (!clickedTarget) return;
    const [timeIndex, value] = data;
    const isClickedMe =
      clickedTarget.trackName === trackName &&
      clickedTarget.xyzType === xyzType &&
      clickedTarget.coordinates?.x === timeIndex &&
      clickedTarget.coordinates?.y === value;
    const isAltClick =
      clickedTarget.alt && clickedTarget.coordinates?.x === timeIndex;
    const isClickedCurveLine =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.trackName === trackName &&
      clickedTarget.xyzType === xyzType;
    if (clickedTarget.ctrl) {
      if (isClickedMe || isAlreadySelected.current || isClickedCurveLine) {
        isAlreadySelected.current = true;
        registerKeyframeObserver();
        setSelected(true);
      }
    } else if (isClickedMe || isAltClick || isClickedCurveLine) {
      isAlreadySelected.current = true;
      registerKeyframeObserver();
      setSelected(true);
    } else {
      isAlreadySelected.current = false;
      setSelected(false);
    }
  }, [
    registerKeyframeObserver,
    clickedTarget,
    keyframeIndex,
    lineIndex,
    trackName,
    xyzType,
    data,
  ]);

  const circleXY = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const circleX = scaleX(data[0]) | 0;
    const circleY = scaleY(data[1]);
    circlePosition.current = { circleX, circleY };
    return { x: circleX, y: circleY };
  }, [data]);

  return (
    <g
      ref={keyframeRef}
      transform={`translate(${circleTranslateXY.x}, ${circleTranslateXY.y})`}
    >
      <circle
        r={2}
        cx={circleXY.x}
        cy={circleXY.y}
        className={cx({ clicked })}
        onClick={handleClickKeyframe}
      />
    </g>
  );
};

export default memo(Keyframe);
