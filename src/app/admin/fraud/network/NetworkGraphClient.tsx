"use client";

import { useEffect, useRef, useState } from "react";
import { Search, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

interface GraphNode {
  id: string;
  username: string;
  risk_score: number;
  is_banned: boolean;
  is_frozen: boolean;
  is_high_risk: boolean;
  total_earned: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  color: string;
}

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const EDGE_COLORS: Record<string, string> = {
  shared_ip: "#f97316",
  referral: "#3b82f6",
  transfer: "#ef4444",
  shared_device: "#a855f7",
};

function getNodeColor(node: GraphNode): string {
  if (node.is_banned) return "#ef4444";
  if (node.is_frozen) return "#3b82f6";
  if (node.is_high_risk) return "#f97316";
  return "#22c55e";
}

export default function NetworkGraphClient({ nodes, edges }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [search, setSearch] = useState("");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Simple force-directed layout using spring forces (no external lib)
  useEffect(() => {
    if (nodes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;

    // Initialize positions in a circle
    const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const r = Math.min(W, H) * 0.35;
      positions.set(n.id, {
        x: W / 2 + r * Math.cos(angle),
        y: H / 2 + r * Math.sin(angle),
        vx: 0,
        vy: 0,
      });
    });

    let animFrame: number;
    const ITERATIONS = 100;
    let iteration = 0;

    const simulate = () => {
      if (iteration >= ITERATIONS) {
        // Save final positions
        positions.forEach((p, id) => positionsRef.current.set(id, { x: p.x, y: p.y }));
        drawGraph(canvas, nodes, edges, positionsRef.current, zoom, pan, search);
        return;
      }

      const k = Math.sqrt((W * H) / Math.max(nodes.length, 1)) * 0.8;

      // Repulsion
      positions.forEach((pos1, id1) => {
        positions.forEach((pos2, id2) => {
          if (id1 === id2) return;
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = (k * k) / d;
          pos1.vx += (dx / d) * force * 0.01;
          pos1.vy += (dy / d) * force * 0.01;
        });
      });

      // Attraction along edges
      edges.forEach(({ source, target }) => {
        const s = positions.get(source);
        const t = positions.get(target);
        if (!s || !t) return;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (d * d) / k * 0.005;
        s.vx += dx * force;
        s.vy += dy * force;
        t.vx -= dx * force;
        t.vy -= dy * force;
      });

      // Center gravity + damping
      positions.forEach((p) => {
        p.vx = (p.vx + (W / 2 - p.x) * 0.001) * 0.85;
        p.vy = (p.vy + (H / 2 - p.y) * 0.001) * 0.85;
        p.x = Math.max(20, Math.min(W - 20, p.x + p.vx));
        p.y = Math.max(20, Math.min(H - 20, p.y + p.vy));
      });

      iteration++;
      animFrame = requestAnimationFrame(simulate);
    };

    animFrame = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animFrame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Redraw when zoom/pan/search changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positionsRef.current.size === 0) return;
    drawGraph(canvas, nodes, edges, positionsRef.current, zoom, pan, search);
  }, [zoom, pan, search, nodes, edges]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      setPan(prev => ({
        x: prev.x + (e.clientX - lastMouse.current.x),
        y: prev.y + (e.clientY - lastMouse.current.y),
      }));
      lastMouse.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top - pan.y) / zoom;
    let found: GraphNode | null = null;
    positionsRef.current.forEach((pos, id) => {
      const node = nodes.find(n => n.id === id);
      if (!node) return;
      const r = Math.max(8, Math.min(20, Math.sqrt(Number(node.total_earned) + 1)));
      if (Math.hypot(mx - pos.x, my - pos.y) < r) found = node;
    });
    setTooltip(found ? { x: e.clientX - rect.left, y: e.clientY - rect.top, node: found } : null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Controls */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="Search by username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ZoomIn size={16} className="text-gray-500" />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ZoomOut size={16} className="text-gray-500" />
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
        <span className="text-xs text-gray-400">{nodes.length} nodes · {edges.length} edges</span>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="w-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          onMouseDown={e => { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }}
          onMouseUp={() => { isDragging.current = false; }}
        />
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm z-10"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
          >
            <div className="font-bold text-[#151d48]">@{tooltip.node.username}</div>
            <div className="text-xs text-gray-400 mt-0.5">Risk: {tooltip.node.risk_score}/100</div>
            <div className="text-xs text-gray-400">Earned: ${Number(tooltip.node.total_earned).toFixed(2)}</div>
            <div className="flex gap-2 mt-1">
              {tooltip.node.is_banned && <span className="text-red-600 font-bold text-[10px]">BANNED</span>}
              {tooltip.node.is_frozen && <span className="text-blue-600 font-bold text-[10px]">FROZEN</span>}
              {tooltip.node.is_high_risk && <span className="text-orange-600 font-bold text-[10px]">HIGH RISK</span>}
            </div>
          </div>
        )}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-300 font-semibold">No graph data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function drawGraph(
  canvas: HTMLCanvasElement,
  nodes: GraphNode[],
  edges: GraphEdge[],
  positions: Map<string, { x: number; y: number }>,
  zoom: number,
  pan: { x: number; y: number },
  search: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  // Draw edges
  edges.forEach(({ source, target, type }) => {
    const s = positions.get(source);
    const t = positions.get(target);
    if (!s || !t) return;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = (EDGE_COLORS[type] ?? "#9ca3af") + "66";
    ctx.lineWidth = 1.5 / zoom;
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach(node => {
    const pos = positions.get(node.id);
    if (!pos) return;
    const color = getNodeColor(node);
    const r = Math.max(8, Math.min(22, 8 + Math.sqrt(Number(node.total_earned) + 1) * 0.5));
    const isHighlighted = search && node.username.toLowerCase().includes(search.toLowerCase());

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isHighlighted ? "#f97316" : color;
    ctx.globalAlpha = search && !isHighlighted ? 0.2 : 1;
    ctx.fill();

    if (node.is_high_risk || isHighlighted) {
      ctx.strokeStyle = isHighlighted ? "#fff" : "#f97316";
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();
    }

    ctx.globalAlpha = search && !isHighlighted ? 0.2 : 0.85;
    ctx.fillStyle = "#374151";
    ctx.font = `${Math.max(9, 11 / zoom)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`@${node.username}`, pos.x, pos.y + r + 12 / zoom);
    ctx.globalAlpha = 1;
  });

  ctx.restore();
}
