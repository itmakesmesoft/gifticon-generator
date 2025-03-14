import Menubar from "./ui/Menubar";
import { useShapeStore } from "@/app/store/canvas";
import { readCodeByImage, convertBarcodeFormat } from "@/utils";
import { useCanvasContext } from "@/app/context/canvas";
import { ChangeEvent } from "react";
import { generateShapeConfig } from "@/utils/canvas";
import Input from "./ui/Input";
import {
  ArrowTopLeftIcon,
  CircleIcon,
  CursorArrowIcon,
  EraserIcon,
  FrameIcon,
  ImageIcon,
  MixIcon,
  Pencil1Icon,
  ResetIcon,
  SquareIcon,
  TextIcon,
} from "@radix-ui/react-icons";
import QrIcon from "./ui/QrIcon";
import { useControl } from "@/app/hooks";

const Sidebar = ({ className }: { className: string }) => {
  const { canvasSize, setCanvasSize } = useCanvasContext();

  const { action, setAction, getAttributes } = useControl();

  const redo = useShapeStore((state) => state.redo);
  const undo = useShapeStore((state) => state.undo);
  const setShapes = useShapeStore((state) => state.setShapes);

  const decodeFromImage = async (image: string | ArrayBuffer | null) => {
    if (!image) return;
    const data = await readCodeByImage(image as string);
    if (!data) return;

    const format = convertBarcodeFormat(data.format);
    const newShape = generateShapeConfig({
      type: "barcode",
      code: data.value,
      codeFormat: format,
      fill: getAttributes.fill,
      stroke: getAttributes.stroke,
    });
    setShapes((shapes) => [...shapes, newShape]);
  };
  const loadFileFromLocal = (
    e: ChangeEvent<HTMLInputElement>,
    callback: (result: string | null) => unknown
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result as string | null);
  };

  const handleAddBarcode = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => {
      if (file) decodeFromImage(file);
    });
  };

  const handleAddImage = (e: ChangeEvent<HTMLInputElement>) => {
    loadFileFromLocal(e, (file) => {
      if (!file) return;

      const newShape = generateShapeConfig({
        type: "image",
        dataURL: file,
        isDrawing: false,
      });
      setShapes((shapes) => [...shapes, newShape]);
    });
  };

  return (
    <Menubar className={`flex flex-col items-center ${className}`}>
      <Menubar.MenuInputFileItem
        accept="image/*"
        onValueChange={handleAddBarcode}
        className="pt-4 group hover:bg-blue-400! active:bg-blue-500!"
        icon={
          <QrIcon width="30" height="30" className="group-hover:fill-white" />
        }
      />
      <Menubar.Separator />
      <Menubar.MenuItem
        onClick={() => setAction("select")}
        label="커서"
        active={action === "select"}
        icon={<CursorArrowIcon width="18" height="18" />}
      />
      <Menubar.MenuItem
        onClick={() => setAction("pencil")}
        label="펜"
        active={action === "pencil"}
        icon={<Pencil1Icon width="18" height="18" />}
      />
      <Menubar.MenuItem
        onClick={() => setAction("eraser")}
        label="지우개"
        active={action === "eraser"}
        icon={<EraserIcon width="18" height="18" />}
      />
      <Menubar.MenuGroup
        label="도형"
        className="text-black"
        onClick={() => setAction("rectangle")}
        icon={<MixIcon width="18" height="18" />}
      >
        <Menubar.MenuGroupItem
          onClick={() => setAction("rectangle")}
          icon={<SquareIcon width="16" height="16" />}
        >
          사각형
        </Menubar.MenuGroupItem>
        <Menubar.MenuGroupItem
          onClick={() => setAction("circle")}
          icon={<CircleIcon width="16" height="16" />}
        >
          원
        </Menubar.MenuGroupItem>
        <Menubar.MenuGroupItem
          onClick={() => setAction("arrow")}
          icon={<ArrowTopLeftIcon width="16" height="16" />}
        >
          화살표
        </Menubar.MenuGroupItem>
      </Menubar.MenuGroup>
      <Menubar.MenuItem
        onClick={() => setAction("text")}
        label="글자"
        active={action === "text"}
        icon={<TextIcon width="18" height="18" />}
      />
      <Menubar.MenuInputFileItem
        accept="image/*"
        onChange={handleAddImage}
        icon={<ImageIcon />}
      />
      <Menubar.MenuGroup
        label="Frame"
        icon={<FrameIcon width="18" height="18" />}
        className="p-2 text-center w-[220px]"
      >
        <p>프레임 크기 조절</p>
        <div className="grid grid-cols-2 gap-4 px-2 py-1">
          <Input
            value={canvasSize.width}
            onValueChange={(e) =>
              setCanvasSize({
                ...canvasSize,
                width: Number(e.target.value),
              })
            }
            className="h-5 bg-white"
            label="W"
          />
          <Input
            value={canvasSize.height}
            onValueChange={(e) =>
              setCanvasSize({
                ...canvasSize,
                height: Number(e.target.value),
              })
            }
            className="h-5 bg-white"
            label="H"
          />
        </div>
      </Menubar.MenuGroup>
      <Menubar.Separator />
      <Menubar.MenuItem
        onClick={undo}
        label="뒤로"
        icon={<ResetIcon width="18" height="18" />}
      />
      <Menubar.MenuItem
        onClick={redo}
        label="앞으로"
        icon={<ResetIcon className="rotate-180" width="18" height="18" />}
        className="pb-3"
      />
    </Menubar>
  );
};

export default Sidebar;
