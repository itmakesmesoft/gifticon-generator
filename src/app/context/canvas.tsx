import Konva from "konva";
import { createContext, ReactNode, useContext, useState } from "react";

interface CanvasContextValueProps {
  setCurrentNodes: (node: Konva.Node[]) => void;
  currentNodes: Konva.Node[];
}

const defaultValue: CanvasContextValueProps = {
  setCurrentNodes: () => {},
  currentNodes: [],
};

const CanvasContext = createContext(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [currentNodes, setCurrentNodes] = useState<Konva.Node[]>([]);
  return (
    <CanvasContext.Provider value={{ currentNodes, setCurrentNodes }}>
      {children}
    </CanvasContext.Provider>
  );
};
