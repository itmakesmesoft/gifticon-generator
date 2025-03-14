import Konva from "konva";
import StrokeWidthIcon from "./ui/StrokeWidthIcon";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { TextAlign, useControlStore, useShapeStore } from "@/app/store/canvas";
import { Select, Slider } from "radix-ui";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  FontBoldIcon,
  FontItalicIcon,
  ChevronDownIcon,
  CheckIcon,
  TextIcon,
} from "@radix-ui/react-icons";
import { useControl, useFonts } from "@/app/hooks";
import { RxTransparencyGrid } from "react-icons/rx";
import Toolbar from "./ui/Toolbar";
import { ColorResult } from "react-color";

const fontStyleOptions = [
  {
    label: "font weight bold",
    value: "900",
    icon: <FontBoldIcon width="24" height="24" />,
  },
  {
    label: "font style italic",
    value: "italic",
    icon: <FontItalicIcon width="24" height="24" />,
  },
];
const textAlignOptions = [
  {
    label: "left",
    value: "left",
    icon: <TextAlignLeftIcon width="24" height="24" />,
  },
  {
    label: "center",
    value: "center",
    icon: <TextAlignCenterIcon width="24" height="24" />,
  },
  {
    label: "right",
    value: "right",
    icon: <TextAlignRightIcon width="24" height="24" />,
  },
];

type PanelType = "text" | "shape" | "brush" | null;

const getProperPanelType = (nodes: Konva.Node[]) => {
  let type = null;
  for (const node of nodes) {
    let tmpType;
    if (node.attrs.type === "text") tmpType = "text";
    else tmpType = "shape";

    if (!type) type = tmpType;
    else if (type !== tmpType) return null;
  }
  return type;
};

const Menubar = ({ className }: { className: string }) => {
  const { selectedNodes } = useCanvasContext();
  const [panelType, setPanelType] = useState<PanelType>(null);
  const setShapes = useShapeStore((state) => state.setShapes);
  const action = useControlStore((state) => state.action);

  useEffect(() => {
    if (selectedNodes.length === 0) {
      switch (action) {
        case "text":
          setPanelType("text");
          break;
        case "pencil":
        case "eraser":
          setPanelType("brush");
          break;
        case "rectangle":
        case "circle":
        case "arrow":
          setPanelType("shape");
          break;
        default:
          setPanelType(null);
      }
      return;
    }

    const type = getProperPanelType(selectedNodes);
    switch (type) {
      case "text":
        setPanelType("text");
        break;
      case "shape":
        setPanelType("shape");
        break;
      default:
        setPanelType(null);
    }
  }, [selectedNodes, action]);

  const updateSelectedShapeAttributes = (newAttrs: Konva.ShapeConfig) => {
    const ids = selectedNodes.map((node) => node.attrs.id);
    if (ids.length === 0) return;

    setShapes((shapes) =>
      shapes.map((shape) => {
        const shapeId = shape.id;
        return shapeId && ids.includes(shapeId)
          ? { ...shape, ...newAttrs }
          : shape;
      })
    );
  };

  return (
    <div className={className}>
      {panelType && (
        <Toolbar>
          {panelType === "shape" && (
            <ShapeControlPanel
              updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            />
          )}
          {panelType === "text" && (
            <TextControlPanel
              updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            />
          )}
          {panelType === "brush" && (
            <BrushControlPanel
              updateSelectedShapeAttributes={updateSelectedShapeAttributes}
            />
          )}
        </Toolbar>
      )}
    </div>
  );
};
interface ControlPanelProps {
  updateSelectedShapeAttributes: (newAttrs: Konva.ShapeConfig) => void;
}

const TextControlPanel = ({
  updateSelectedShapeAttributes,
}: ControlPanelProps) => {
  const { fontList, loadFontFamily, fontDict } = useFonts();
  const { getAttributes, setAttributes } = useControl();

  const onFontStylesChange = (values: string[]) => {
    const fontStyle = values.includes("italic") ? "italic" : "normal";
    const fontWeight = values.includes("900") ? "900" : "400";

    setAttributes.setFontStyle(fontStyle);
    setAttributes.setFontWeight(fontWeight);
    updateSelectedShapeAttributes({ fontStyle, fontWeight });
  };

  const onTextAlignChange = (textAlign: string) => {
    setAttributes.setTextAlign(textAlign as TextAlign);
    updateSelectedShapeAttributes({ textAlign });
  };

  const onFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setAttributes.setFontSize(size);
    updateSelectedShapeAttributes({ fontSize: size });
  };

  const onFontFamilyChange = async (fontFamily: string) => {
    const res = await loadFontFamily(fontFamily);

    if (!res) return;
    const typeFace = fontDict[fontFamily].category;

    setAttributes.setFontFamily(fontFamily);
    setAttributes.setTypeFace(typeFace);
    updateSelectedShapeAttributes({ fontFamily, typeFace });
  };

  const onFontColorChange = (value: ColorResult) => {
    setAttributes.setFill(value.hex);
    updateSelectedShapeAttributes({ fill: value.hex });
  };

  return (
    <>
      <Toolbar.ToggleGroup
        type="multiple"
        items={fontStyleOptions}
        value={[getAttributes.fontStyle, String(getAttributes.fontWeight)]}
        onValueChange={onFontStylesChange}
      />
      <Toolbar.ToggleGroup
        type="single"
        items={textAlignOptions}
        value={getAttributes.textAlign}
        onValueChange={onTextAlignChange}
      />
      <Toolbar.Separator />
      <Toolbar.Select
        defaultValue={getAttributes.fontFamily}
        onValueChange={onFontFamilyChange}
        className="w-[150px] overflow-hidden"
        title={
          <>
            <Select.Value placeholder="Select a font" asChild>
              <span className="overflow-hidden text-ellipsis text-nowrap">
                {getAttributes.fontFamily}
              </span>
            </Select.Value>
            <Select.Icon className="">
              <ChevronDownIcon />
            </Select.Icon>
          </>
        }
      >
        {fontList?.map((item, index) => (
          <Toolbar.SelectItem
            icon={getAttributes.fontFamily === item.family && <CheckIcon />}
            className={
              getAttributes.fontFamily === item.family
                ? "text-gray-700! font-semibold"
                : ""
            }
            key={index}
            value={item.family}
            label={item.family}
          />
        ))}
      </Toolbar.Select>
      <Toolbar.Input
        value={String(getAttributes.fontSize)}
        onChange={onFontSizeChange}
      />
      <Toolbar.ColorPicker
        color={getAttributes.fill}
        onValueChangeComplete={onFontColorChange}
        variant="custom"
        customTitle={(currentColor) => (
          <span className="flex flex-col justify-between items-center w-[24px] h-[24px]">
            <TextIcon width="19" height="19" />
            <span
              className="w-full h-1 inline-block rounded-xs"
              style={{ background: currentColor }}
            />
          </span>
        )}
      />
    </>
  );
};

const ShapeControlPanel = ({
  updateSelectedShapeAttributes,
}: ControlPanelProps) => {
  const { getAttributes, setAttributes } = useControl();

  const onFillChange = (value: ColorResult) => {
    setAttributes.setFill(value.hex);
    updateSelectedShapeAttributes({ fill: value.hex });
  };

  const onStrokeChange = (value: ColorResult) => {
    setAttributes.setStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onStrokeWidthChange = (value: number[]) => {
    setAttributes.setStrokeWidth(value[0]);
    updateSelectedShapeAttributes({ strokeWidth: value[0] });
  };

  const onOpacityChange = (value: number[]) => {
    setAttributes.setOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  return (
    <>
      <Toolbar.ColorPicker
        color={getAttributes.fill}
        onValueChangeComplete={onFillChange}
      />
      <Toolbar.ColorPicker
        variant="border"
        color={getAttributes.stroke}
        onValueChangeComplete={onStrokeChange}
      />
      <Toolbar.Dropdown
        title={
          <RxTransparencyGrid
            width="24"
            height="24"
            style={{ background: `rgba(0,0,0,${getAttributes.opacity})` }}
          />
        }
      >
        <p>Opacity</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={1}
          min={0}
          value={[getAttributes.opacity]}
          onValueChange={onOpacityChange}
          step={0.01}
        >
          <Slider.Track className="bg-black relative grow-1 h-1">
            <Slider.Range className="absolute bg-blue-500 h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-red-500 rounded-full"
            aria-label="opacity"
          />
        </Slider.Root>
      </Toolbar.Dropdown>
      <Toolbar.Dropdown
        title={
          <span className="flex flex-row gap-0.5 items-center min-w-10">
            <StrokeWidthIcon
              width="24"
              height="24"
              className="group-hover:fill-red-600"
            />
            <span>{getAttributes.strokeWidth}</span>
          </span>
        }
      >
        <p>Stroke Width</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={100}
          min={0}
          value={[getAttributes.strokeWidth]}
          onValueChange={onStrokeWidthChange}
          step={1}
        >
          <Slider.Track className="bg-black relative grow-1 h-1">
            <Slider.Range className="absolute bg-blue-500 h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-red-500 rounded-full"
            aria-label="opacity"
          />
        </Slider.Root>
      </Toolbar.Dropdown>
    </>
  );
};

const BrushControlPanel = ({
  updateSelectedShapeAttributes,
}: ControlPanelProps) => {
  const { getAttributes, setAttributes } = useControl();

  const onBrushColorChange = (value: ColorResult) => {
    setAttributes.setStroke(value.hex);
    updateSelectedShapeAttributes({ stroke: value.hex });
  };

  const onBrushWidthChange = (value: number) => {
    setAttributes.setStrokeWidth(value);
    updateSelectedShapeAttributes({ strokeWidth: value });
  };

  const onOpacityChange = (value: number[]) => {
    setAttributes.setOpacity(value[0]);
    updateSelectedShapeAttributes({ opacity: value[0] });
  };

  return (
    <>
      <Toolbar.ColorPicker
        color={getAttributes.stroke}
        onValueChangeComplete={onBrushColorChange}
      />
      <Toolbar.Dropdown
        title={
          <RxTransparencyGrid
            width="24"
            height="24"
            style={{ background: `rgba(0,0,0,${getAttributes.opacity})` }}
          />
        }
      >
        <p>Opacity</p>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-[200px] h-4"
          max={1}
          min={0}
          value={[getAttributes.opacity]}
          onValueChange={onOpacityChange}
          step={0.01}
        >
          <Slider.Track className="bg-black relative grow-1 h-1">
            <Slider.Range className="absolute bg-blue-500 h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-red-500 rounded-full"
            aria-label="opacity"
          />
        </Slider.Root>
      </Toolbar.Dropdown>
      <BrushRadiusControl
        value={getAttributes.strokeWidth}
        onValueChange={onBrushWidthChange}
      />
    </>
  );
};

export default Menubar;

const BrushRadiusControl = ({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) => {
  const [brushRadius, setBrushRadius] = useState<number>(value);
  const radius = 0.16 * Math.max(brushRadius, 1) + 4;

  // TODO. debounce 별도의 훅으로 분리하기
  const debounceRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onValueChange(brushRadius);
      debounceRef.current = null;
    }, 100);
  }, [brushRadius, onValueChange]);

  return (
    <Toolbar.Dropdown
      title={
        <span className="flex flex-row gap-0.5 items-center">
          <span className="w-[25px] flex justify-center items-center">
            <span
              className="rounded-full bg-black inline-block"
              style={{ width: radius, height: radius }}
            />
          </span>
          <span>{brushRadius}</span>
        </span>
      }
    >
      <p>Stroke Width</p>
      {/* TODO. 추후 BrushWidth를 따로 빼야함 */}
      <Slider.Root
        className="relative flex items-center select-none touch-none w-[200px] h-4"
        max={100}
        min={1}
        value={[brushRadius]}
        onValueChange={(value) => setBrushRadius(value[0])}
        step={1}
      >
        <Slider.Track className="bg-black relative grow-1 h-1">
          <Slider.Range className="absolute bg-blue-500 h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-red-500 rounded-full"
          aria-label="opacity"
        />
      </Slider.Root>
    </Toolbar.Dropdown>
  );
};
