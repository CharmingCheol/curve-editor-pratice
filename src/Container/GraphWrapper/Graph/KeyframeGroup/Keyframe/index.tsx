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
import { ClickedTarget, KeyframeValue } from "types/curveEditor";
import useDragCurveEditor from "Container/useDragCurveEditor";
import Scale from "Container/scale";
import Observer from "Container/observer";
import BezierHandles from "./BezierHandles";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface Props {
  boneIndex: number;
  boneName: string;
  keyframeIndex: number;
  keyframeValue: KeyframeValue;
  xyzType: "x" | "y" | "z";
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { boneIndex, boneName, keyframeValue, keyframeIndex, xyzType } = props;
  const keyframePosition = useRef({ circleX: 0, circleY: 0 });
  const keyframeRef = useRef<SVGGElement>(null);
  const isAlreadySelectedKeyframe = useRef(false);
  const dispatch = useDispatch();

  const [clickedkeyframe, setSelectedKeyframe] = useState(false);
  const [circleTranslateXY, setCircleTranslateXY] = useState({ x: 0, y: 0 });
  const [updateBezierHandle, setUpdateBezierHandle] = useState(0);
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const clickedTarget: ClickedTarget = {
        targetType: "keyframe",
        boneName,
        xyzType,
        ctrl: event.ctrlKey || event.metaKey,
        alt: event.altKey,
        coordinates: {
          x: keyframeValue.keyframe.x,
          y: keyframeValue.keyframe.y,
        },
      };
      const action = curveEditor.changeClickedTarget({ clickedTarget });
      dispatch(action);
    },
    [boneName, dispatch, keyframeValue, xyzType]
  );

  // 옵저버에 선택 된 키프레임 추가
  const registerKeyframeObserver = useCallback(() => {
    Observer.registerKeyframe({
      call: ({ x, y }) => {
        const invertScaleX = Scale.getScaleX().invert;
        const invertScaleY = Scale.getScaleY().invert;
        const { circleX, circleY } = keyframePosition.current;
        const time = Math.round(invertScaleX(circleX + x));
        const value = invertScaleY(circleY + y);
        setCircleTranslateXY({ x, y });
        return {
          boneIndex,
          keyframeIndex,
          x: time,
          y: value,
        };
      },
    });
  }, [boneIndex, keyframeIndex]);

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
    if (!clickedTarget) {
      isAlreadySelectedKeyframe.current = false;
      setSelectedKeyframe(false);
      return;
    }
    const { x, y } = keyframeValue.keyframe;
    const isClickedMe =
      clickedTarget.boneName === boneName &&
      clickedTarget.xyzType === xyzType &&
      clickedTarget.coordinates?.x === x &&
      clickedTarget.coordinates?.y === y;
    const isAltClick = clickedTarget.alt && clickedTarget.coordinates?.x === x;
    const isClickedCurveLine =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.boneName === boneName &&
      clickedTarget.xyzType === xyzType;
    if (clickedTarget.ctrl) {
      if (
        isClickedMe ||
        isAlreadySelectedKeyframe.current ||
        isClickedCurveLine
      ) {
        isAlreadySelectedKeyframe.current = true;
        registerKeyframeObserver();
        setSelectedKeyframe(true);
        setUpdateBezierHandle((prev) => prev + 1);
      }
    } else if (isClickedMe || isAltClick || isClickedCurveLine) {
      isAlreadySelectedKeyframe.current = true;
      registerKeyframeObserver();
      setSelectedKeyframe(true);
      setUpdateBezierHandle((prev) => prev + 1);
    } else {
      isAlreadySelectedKeyframe.current = false;
      setSelectedKeyframe(false);
    }
    return () => setSelectedKeyframe(false);
  }, [
    registerKeyframeObserver,
    boneIndex,
    boneName,
    clickedTarget,
    keyframeIndex,
    keyframeValue,
    xyzType,
  ]);

  const circleXY = useMemo(() => {
    const scaleX = Scale.getScaleX();
    const scaleY = Scale.getScaleY();
    const circleX = scaleX(keyframeValue.keyframe.x) | 0;
    const circleY = scaleY(keyframeValue.keyframe.y);
    keyframePosition.current = { circleX, circleY };
    return { x: circleX, y: circleY };
  }, [keyframeValue]);

  return (
    <g
      ref={keyframeRef}
      transform={`translate(${circleTranslateXY.x}, ${circleTranslateXY.y})`}
    >
      {clickedkeyframe && (
        <BezierHandles
          data={keyframeValue}
          boneIndex={boneIndex}
          updateBezierHandle={updateBezierHandle}
        />
      )}
      <circle
        r={1.5}
        cx={circleXY.x}
        cy={circleXY.y}
        className={cx({ clicked: clickedkeyframe })}
        onClick={handleClickKeyframe}
      />
    </g>
  );
};

export default memo(Keyframe);
