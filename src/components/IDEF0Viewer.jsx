import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

function IDEF0Node({ data, selected }) {
  return (
    <div
      className={`px-4 py-3 border-2 rounded min-w-[120px] text-center bg-white ${
        selected ? "border-blue-500" : "border-gray-800"
      }`}
    >
      <div className="font-semibold text-sm">{data.label || "Функція"}</div>
      {data.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}
    </div>
  );
}

const nodeTypes = {
  idef0: IDEF0Node,
};

export default function IDEF0Viewer({ modelData }) {
  const parsedModel = useMemo(() => {
    if (!modelData) return null;
    try {
      return typeof modelData === "string" ? JSON.parse(modelData) : modelData;
    } catch {
      return null;
    }
  }, [modelData]);

  if (!parsedModel || !parsedModel.nodes) {
    return (
      <div className="p-4 text-center text-gray-500">
        Немає даних для відображення
      </div>
    );
  }

  const nodes = parsedModel.nodes.map((node) => ({
    ...node,
    type: "idef0",
  }));

  const edges = parsedModel.edges || [];

  return (
    <div className="w-full h-[500px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

