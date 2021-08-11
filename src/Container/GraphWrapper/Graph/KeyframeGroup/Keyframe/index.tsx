import React, {
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
  axisType: "x" | "y" | "z";
  boneIndex: number;
  boneName: string;
  breakHandle: boolean;
  keyframeIndex: number;
  keyframeValue: KeyframeValue;
  lockHandle: boolean;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const {
    axisType,
    boneIndex,
    boneName,
    breakHandle,
    keyframeValue,
    keyframeIndex,
    lockHandle,
  } = props;
  const keyframePosition = useRef({ circleX: 0, circleY: 0 });
  const keyframeRef = useRef<SVGGElement>(null);
  const isAlreadySelected = useRef(false);
  const dispatch = useDispatch();

  const [selectedkeyframe, setSelectedKeyframe] = useState(false);
  const [circleTranslateXY, setCircleTranslateXY] = useState({ x: 0, y: 0 });
  const clickedTarget = useSelector((state) => state.curveEditor.clickedTarget);

  // 키프레임 클릭
  const handleClickKeyframe = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const clickedTarget: ClickedTarget = {
        alt: event.altKey,
        boneIndex: boneIndex,
        axisType: axisType,
        ctrl: event.ctrlKey || event.metaKey,
        coordinates: {
          x: keyframeValue.keyframe.x,
          y: keyframeValue.keyframe.y,
        },
        targetType: "keyframe",
      };
      const action = curveEditor.changeClickedTarget({ clickedTarget });
      dispatch(action);
    },
    [boneIndex, dispatch, keyframeValue, axisType]
  );

  // 옵저버에 선택 된 키프레임 추가
  const registerKeyframeObserver = useCallback(() => {
    Observer.registerKeyframe({
      keyframeIndex,
      boneIndex,
      breakHandle,
      lockHandle,
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
  }, [boneIndex, breakHandle, keyframeIndex, lockHandle]);

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
    const setSelectedEffect = () => {
      isAlreadySelected.current = true;
      registerKeyframeObserver();
      setSelectedKeyframe(true);
    };
    const setDeselectedEffect = () => {
      isAlreadySelected.current = false;
      setSelectedKeyframe(false);
    };
    if (!clickedTarget) return setDeselectedEffect();
    const { x, y } = keyframeValue.keyframe;
    const isClickedMe =
      clickedTarget.boneIndex === boneIndex &&
      clickedTarget.coordinates?.x === x;
    const isClickedCurveLine =
      clickedTarget.targetType === "curveLine" &&
      clickedTarget.boneIndex === boneIndex;
    const isAltClick = clickedTarget.alt && clickedTarget.coordinates?.x === x;
    const selectedCondition = isClickedMe || isClickedCurveLine;
    if (clickedTarget.ctrl) {
      if (selectedCondition || isAlreadySelected.current) setSelectedEffect();
    } else if (selectedCondition || isAltClick) {
      setSelectedEffect();
    } else {
      setDeselectedEffect();
    }
  }, [
    registerKeyframeObserver,
    boneIndex,
    boneName,
    clickedTarget,
    keyframeIndex,
    keyframeValue,
    axisType,
    dispatch,
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
      {selectedkeyframe && (
        <BezierHandles
          boneIndex={boneIndex}
          breakHandle={breakHandle}
          lockHandle={lockHandle}
          keyframeData={keyframeValue.keyframe}
          handlesData={keyframeValue.handles}
        />
      )}
      <circle
        r={1.5}
        cx={circleXY.x}
        cy={circleXY.y}
        className={cx({ clicked: selectedkeyframe })}
        onClick={handleClickKeyframe}
      />
    </g>
  );
};

export default Keyframe;
