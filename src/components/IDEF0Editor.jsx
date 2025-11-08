import React, { useCallback, useRef, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Upload, Save, Trash2, Plus, Edit2, FileDown, FileUp, FileText, LayoutTemplate } from "lucide-react";

const arrowTypes = {
  input: { label: "Вхід", color: "#3b82f6", position: "left" },
  control: { label: "Керування", color: "#8b5cf6", position: "top" },
  mechanism: { label: "Механізм", color: "#10b981", position: "bottom" },
  output: { label: "Вихід", color: "#f59e0b", position: "right" },
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Шаблон IDEF0 моделі з прикладом правильної структури
const templateModel = {
  nodes: [
    {
      id: "template-1",
      type: "idef0",
      position: { x: 250, y: 300 },
      data: { 
        label: "Обробка замовлення", 
        description: "Обробка вхідного замовлення клієнта" 
      },
    },
    {
      id: "template-2",
      type: "idef0",
      position: { x: 550, y: 300 },
      data: { 
        label: "Перевірка наявності", 
        description: "Перевірка наявності товару на складі" 
      },
    },
    {
      id: "template-3",
      type: "idef0",
      position: { x: 850, y: 300 },
      data: { 
        label: "Формування відвантаження", 
        description: "Підготовка товару до відправки" 
      },
    },
    // Вхідні дані (ліворуч)
    {
      id: "template-input-1",
      type: "idef0",
      position: { x: 50, y: 300 },
      data: { 
        label: "Замовлення клієнта", 
        description: "Вхідні дані" 
      },
    },
    // Керування (зверху)
    {
      id: "template-control-1",
      type: "idef0",
      position: { x: 250, y: 100 },
      data: { 
        label: "Правила обробки", 
        description: "Керування" 
      },
    },
    {
      id: "template-control-2",
      type: "idef0",
      position: { x: 550, y: 100 },
      data: { 
        label: "Правила перевірки", 
        description: "Керування" 
      },
    },
    // Механізми (знизу)
    {
      id: "template-mechanism-1",
      type: "idef0",
      position: { x: 250, y: 500 },
      data: { 
        label: "Система обробки", 
        description: "Механізм" 
      },
    },
    {
      id: "template-mechanism-2",
      type: "idef0",
      position: { x: 550, y: 500 },
      data: { 
        label: "База даних складу", 
        description: "Механізм" 
      },
    },
    {
      id: "template-mechanism-3",
      type: "idef0",
      position: { x: 850, y: 500 },
      data: { 
        label: "Система логістики", 
        description: "Механізм" 
      },
    },
    // Вихідні дані (праворуч)
    {
      id: "template-output-1",
      type: "idef0",
      position: { x: 1150, y: 300 },
      data: { 
        label: "Відвантажений товар", 
        description: "Вихідні дані" 
      },
    },
  ],
  edges: [
    // Входи (синій) - зліва направо
    {
      id: "template-edge-input-1",
      source: "template-input-1",
      target: "template-1",
      type: "smoothstep",
      label: "Замовлення",
      labelStyle: { fill: arrowTypes.input.color, fontWeight: 600 },
      style: { stroke: arrowTypes.input.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.input.color,
      },
      data: { type: "input" },
    },
    {
      id: "template-edge-input-2",
      source: "template-1",
      target: "template-2",
      type: "smoothstep",
      label: "Оброблене замовлення",
      labelStyle: { fill: arrowTypes.input.color, fontWeight: 600 },
      style: { stroke: arrowTypes.input.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.input.color,
      },
      data: { type: "input" },
    },
    {
      id: "template-edge-input-3",
      source: "template-2",
      target: "template-3",
      type: "smoothstep",
      label: "Інформація про товар",
      labelStyle: { fill: arrowTypes.input.color, fontWeight: 600 },
      style: { stroke: arrowTypes.input.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.input.color,
      },
      data: { type: "input" },
    },
    // Керування (фіолетовий) - зверху вниз
    {
      id: "template-edge-control-1",
      source: "template-control-1",
      target: "template-1",
      type: "smoothstep",
      label: "Правила обробки",
      labelStyle: { fill: arrowTypes.control.color, fontWeight: 600 },
      style: { stroke: arrowTypes.control.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.control.color,
      },
      data: { type: "control" },
    },
    {
      id: "template-edge-control-2",
      source: "template-control-2",
      target: "template-2",
      type: "smoothstep",
      label: "Правила перевірки",
      labelStyle: { fill: arrowTypes.control.color, fontWeight: 600 },
      style: { stroke: arrowTypes.control.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.control.color,
      },
      data: { type: "control" },
    },
    // Механізми (зелений) - знизу вгору
    {
      id: "template-edge-mechanism-1",
      source: "template-mechanism-1",
      target: "template-1",
      type: "smoothstep",
      label: "Система обробки",
      labelStyle: { fill: arrowTypes.mechanism.color, fontWeight: 600 },
      style: { stroke: arrowTypes.mechanism.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.mechanism.color,
      },
      data: { type: "mechanism" },
    },
    {
      id: "template-edge-mechanism-2",
      source: "template-mechanism-2",
      target: "template-2",
      type: "smoothstep",
      label: "База даних",
      labelStyle: { fill: arrowTypes.mechanism.color, fontWeight: 600 },
      style: { stroke: arrowTypes.mechanism.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.mechanism.color,
      },
      data: { type: "mechanism" },
    },
    {
      id: "template-edge-mechanism-3",
      source: "template-mechanism-3",
      target: "template-3",
      type: "smoothstep",
      label: "Система логістики",
      labelStyle: { fill: arrowTypes.mechanism.color, fontWeight: 600 },
      style: { stroke: arrowTypes.mechanism.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.mechanism.color,
      },
      data: { type: "mechanism" },
    },
    // Виходи (помаранчевий) - зліва направо
    {
      id: "template-edge-output-1",
      source: "template-1",
      target: "template-2",
      type: "smoothstep",
      label: "Оброблене замовлення",
      labelStyle: { fill: arrowTypes.output.color, fontWeight: 600 },
      style: { stroke: arrowTypes.output.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.output.color,
      },
      data: { type: "output" },
    },
    {
      id: "template-edge-output-2",
      source: "template-2",
      target: "template-3",
      type: "smoothstep",
      label: "Підтверджене замовлення",
      labelStyle: { fill: arrowTypes.output.color, fontWeight: 600 },
      style: { stroke: arrowTypes.output.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.output.color,
      },
      data: { type: "output" },
    },
    {
      id: "template-edge-output-3",
      source: "template-3",
      target: "template-output-1",
      type: "smoothstep",
      label: "Відвантажений товар",
      labelStyle: { fill: arrowTypes.output.color, fontWeight: 600 },
      style: { stroke: arrowTypes.output.color, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowTypes.output.color,
      },
      data: { type: "output" },
    },
  ],
};

// Функція для створення початкової моделі з шаблону
function createInitialModelFromTemplate() {
  const newNodes = templateModel.nodes.map((node) => ({
    ...node,
    id: uid(),
  }));

  const nodeIdMap = {};
  templateModel.nodes.forEach((oldNode, index) => {
    nodeIdMap[oldNode.id] = newNodes[index].id;
  });

  const newEdges = templateModel.edges.map((edge) => ({
    ...edge,
    id: uid(),
    source: nodeIdMap[edge.source],
    target: nodeIdMap[edge.target],
  }));

  return { nodes: newNodes, edges: newEdges };
}

// Використовуємо шаблон як початкову модель за замовчуванням
const initialTemplateData = createInitialModelFromTemplate();
const initialNodes = initialTemplateData.nodes;
const initialEdges = initialTemplateData.edges;

function IDEF0Node({ data, selected: isSelected }) {
  return (
    <div
      className={`px-4 py-3 border-2 rounded min-w-[120px] text-center bg-white relative ${
        isSelected ? "border-blue-500 shadow-lg" : "border-gray-800"
      }`}
    >
      {/* Handle для входів (ліворуч) - можна приймати та віддавати */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-in"
        style={{ background: arrowTypes.input.color, width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-out"
        style={{ background: arrowTypes.input.color, width: 10, height: 10 }}
      />
      
      {/* Handle для керування (зверху) - можна приймати та віддавати */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-in"
        style={{ background: arrowTypes.control.color, width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-out"
        style={{ background: arrowTypes.control.color, width: 10, height: 10 }}
      />
      
      {/* Handle для механізмів (знизу) - можна приймати та віддавати */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-in"
        style={{ background: arrowTypes.mechanism.color, width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-out"
        style={{ background: arrowTypes.mechanism.color, width: 10, height: 10 }}
      />
      
      {/* Handle для виходів (праворуч) - можна приймати та віддавати */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-in"
        style={{ background: arrowTypes.output.color, width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-out"
        style={{ background: arrowTypes.output.color, width: 10, height: 10 }}
      />
      
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

export default function IDEF0Editor({ onSave, initialData, idef0Models = [], onLoad }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes || initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges || initialEdges
  );
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [sourceNode, setSourceNode] = useState(null); // Для створення зв'язків
  const [newArrowType, setNewArrowType] = useState("input");
  const [newArrowLabel, setNewArrowLabel] = useState("");
  const fileInputRef = useRef(null);

  const loadModel = useCallback((model) => {
    if (model && model.nodes && model.edges) {
      setNodes(model.nodes);
      setEdges(model.edges);
    }
  }, [setNodes, setEdges]);

  const loadTemplate = useCallback(() => {
    if (!confirm("Завантажити шаблон? Поточні зміни буде втрачено.")) {
      return;
    }

    // Використовуємо функцію для створення нової моделі з шаблону
    const templateData = createInitialModelFromTemplate();
    
    setNodes(templateData.nodes);
    setEdges(templateData.edges);
    setSelectedNode(null);
    setSelectedEdge(null);
    setSourceNode(null);
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      const edgeType = newArrowType;
      const edge = {
        ...params,
        id: uid(),
        type: "smoothstep",
        animated: false,
        label: newArrowLabel || arrowTypes[edgeType].label,
        labelStyle: { fill: arrowTypes[edgeType].color, fontWeight: 600 },
        style: { stroke: arrowTypes[edgeType].color, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: arrowTypes[edgeType].color,
        },
        data: { type: edgeType },
      };

      setEdges((eds) => addEdge(edge, eds));
      setNewArrowLabel("");
    },
    [nodes, newArrowType, newArrowLabel, setEdges]
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: uid(),
      type: "idef0",
      position: {
        x: Math.random() * 500 + 200,
        y: Math.random() * 400 + 200,
      },
      data: { label: "Нова функція", description: "" },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode)
      );
      setSelectedNode(null);
    }
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    // Якщо натиснуто з Ctrl/Cmd, вибираємо як source для створення зв'язку
    if (event.ctrlKey || event.metaKey) {
      if (sourceNode === node.id) {
        setSourceNode(null);
      } else if (sourceNode && sourceNode !== node.id) {
        // Створюємо зв'язок від sourceNode до node
        const edgeType = newArrowType;
        const newEdge = {
          id: uid(),
          source: sourceNode,
          target: node.id,
          type: "smoothstep",
          label: newArrowLabel || arrowTypes[edgeType].label,
          labelStyle: { fill: arrowTypes[edgeType].color, fontWeight: 600 },
          style: { stroke: arrowTypes[edgeType].color, strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: arrowTypes[edgeType].color,
          },
          data: { type: edgeType },
        };
        setEdges((eds) => addEdge(newEdge, eds));
        setSourceNode(null);
        setNewArrowLabel("");
      } else {
        setSourceNode(node.id);
      }
    } else {
      setSelectedNode(node.id);
      setSelectedEdge(null);
      setSourceNode(null);
      // Оновлюємо nodes, щоб показати вибраний стан
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
      // Скидаємо вибір для всіх edges
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: false,
        }))
      );
    }
  }, [setNodes, setEdges, sourceNode, newArrowType, newArrowLabel]);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge.id);
    setSelectedNode(null);
    // Оновлюємо edges, щоб показати вибраний стан
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        selected: e.id === edge.id,
      }))
    );
    // Скидаємо вибір для всіх nodes
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    );
  }, [setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setSourceNode(null); // Скидаємо source при кліку на порожню область
    // Скидаємо вибір для всіх nodes та edges
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        selected: false,
      }))
    );
  }, [setNodes, setEdges]);

  const exportModel = useCallback(() => {
    const data = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        data: e.data,
        style: e.style,
        labelStyle: e.labelStyle,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `idef0_model_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const importModel = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (error) {
        alert("Помилка при завантаженні файлу: " + error.message);
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          data: e.data,
          style: e.style,
          labelStyle: e.labelStyle,
        })),
      });
    }
  }, [nodes, edges, onSave]);

  const selectedNodeData = useMemo(() => {
    return nodes.find((n) => n.id === selectedNode);
  }, [nodes, selectedNode]);

  const selectedEdgeData = useMemo(() => {
    return edges.find((e) => e.id === selectedEdge);
  }, [edges, selectedEdge]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">IDEF0 Редактор</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadTemplate} variant="outline" size="sm">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Завантажити шаблон
          </Button>
          <Button onClick={addNode} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Додати блок
          </Button>
          <Button
            onClick={deleteSelected}
            variant="outline"
            size="sm"
            disabled={!selectedNode && !selectedEdge}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Видалити
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importModel}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Завантажити
          </Button>
          <Button onClick={exportModel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Експорт
          </Button>
          {onSave && (
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Зберегти
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 p-4 bg-gray-50 overflow-auto">
        <div className="col-span-1 space-y-4">
          {idef0Models && idef0Models.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Збережені моделі</h3>
                <div className="space-y-2">
                  {idef0Models.map((model) => (
                    <Button
                      key={model.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => loadModel(model)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {new Date(model.createdAt).toLocaleDateString()}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Налаштування стрілки</h3>
              <div className="space-y-3">
                <div>
                  <Label>Тип стрілки</Label>
                  <Select value={newArrowType} onValueChange={setNewArrowType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(arrowTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <span
                            className="inline-block w-3 h-3 rounded mr-2"
                            style={{ backgroundColor: value.color }}
                          />
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Підпис стрілки</Label>
                  <Input
                    value={newArrowLabel}
                    onChange={(e) => setNewArrowLabel(e.target.value)}
                    placeholder="Назва стрілки"
                  />
                </div>
                <div className="text-xs text-gray-500 space-y-2">
                  <div className="font-semibold">Як створити зв'язок:</div>
                  <div>1. Виберіть тип стрілки</div>
                  <div>2. Натисніть на блок (джерело) з Ctrl/Cmd</div>
                  <div>3. Натисніть на інший блок (призначення)</div>
                  <div className="pt-2 border-t">
                    Або перетягніть від ручки одного блоку до іншого
                  </div>
                  {sourceNode && (
                    <div className="pt-2 border-t text-blue-600 font-semibold">
                      Вибрано джерело. Натисніть на блок призначення з Ctrl/Cmd
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {(selectedNodeData || selectedEdgeData) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">
                  {selectedNodeData ? "Властивості блоку" : "Властивості стрілки"}
                </h3>
                {selectedNodeData && (
                  <div className="space-y-3">
                    <div>
                      <Label>Назва</Label>
                      <Input
                        value={selectedNodeData.data.label || ""}
                        onChange={(e) =>
                          updateNodeData(selectedNode, { label: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Опис</Label>
                      <Input
                        value={selectedNodeData.data.description || ""}
                        onChange={(e) =>
                          updateNodeData(selectedNode, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Опис функції"
                      />
                    </div>
                  </div>
                )}
                {selectedEdgeData && (
                  <div className="space-y-3">
                    <div>
                      <Label>Підпис</Label>
                      <Input
                        value={selectedEdgeData.label || ""}
                        onChange={(e) => {
                          setEdges((eds) =>
                            eds.map((edge) =>
                              edge.id === selectedEdge
                                ? { ...edge, label: e.target.value }
                                : edge
                            )
                          );
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Тип: {arrowTypes[selectedEdgeData.data?.type]?.label || "Невідомий"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Легенда</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(arrowTypes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: value.color }}
                    />
                    <span>{value.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 bg-white rounded-lg border shadow-sm min-h-[600px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionLineStyle={{ stroke: arrowTypes[newArrowType].color, strokeWidth: 2 }}
            fitView
            className="bg-gray-50"
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: false,
            }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

