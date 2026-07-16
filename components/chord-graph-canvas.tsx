'use client';

import { useEffect, useRef } from 'react';
import { CHORD_FUNCTION_COLORS, type ChordGraph, type ChordFunction } from '@/lib/chord-data';

interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  function: ChordFunction;
}

interface GraphEdge {
  from: GraphNode;
  to: GraphNode;
  weight: number;
}

interface ChordGraphCanvasProps {
  graph: ChordGraph;
  translateFunc?: (numeral: string) => string;
  onNodeClick?: (numeral: string, chordName: string) => void;
  height?: number;
}

const BG_COLOR = '#100e1c';
const GRID_COLOR = '#1e1a30';
const EDGE_COLOR = '124, 92, 252'; // violet, as an "r, g, b" string for rgba()
const ARROW_COLOR = '#a78bfa';

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function fontSizeFor(text: string): number {
  if (text.length <= 2) return 16;
  if (text.length <= 4) return 14;
  if (text.length <= 6) return 12;
  return 10;
}

/**
 * Visualisasi graf akor interaktif (node = chord, edge = kemungkinan transisi).
 * Port dari js/graphRenderer.js (vanilla Canvas API) ke Client Component React.
 * Layout & drawing logic sengaja tetap imperative (bukan re-render React per frame)
 * untuk performa hover/klik yang mulus, persis seperti versi aslinya.
 */
export function ChordGraphCanvas({ graph, translateFunc, onNodeClick, height = 500 }: ChordGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const hoveredRef = useRef<GraphNode | null>(null);
  const selectedRef = useRef<GraphNode | null>(null);
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function getNodeAtPosition(x: number, y: number): GraphNode | null {
      for (const node of nodesRef.current) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) <= node.radius) return node;
      }
      return null;
    }

    function calculateLayout() {
      if (!canvas) return;
      const chordNames = Object.keys(graph);
      const nodeCount = chordNames.length;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 80;

      const nodes: GraphNode[] = chordNames.map((chord, index) => {
        const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const displayName = translateFunc ? translateFunc(chord) : chord;
        return {
          id: chord,
          name: displayName,
          x,
          y,
          radius: 35,
          function: (graph[chord].function || 'default') as ChordFunction,
        };
      });

      const edges: GraphEdge[] = [];
      chordNames.forEach((fromChord) => {
        const { targets, weights } = graph[fromChord];
        targets.forEach((toChord, idx) => {
          const fromNode = nodes.find((n) => n.id === fromChord);
          const toNode = nodes.find((n) => n.id === toChord);
          if (fromNode && toNode) {
            edges.push({ from: fromNode, to: toNode, weight: weights ? weights[idx] : 50 });
          }
        });
      });

      nodesRef.current = nodes;
      edgesRef.current = edges;
    }

    function drawGrid() {
      if (!ctx || !canvas) return;
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    function drawArrowHead(x: number, y: number, angle: number, lineWidth: number) {
      if (!ctx) return;
      const arrowLength = 12 + lineWidth;
      const arrowAngle = Math.PI / 6;
      ctx.fillStyle = ARROW_COLOR;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - arrowLength * Math.cos(angle - arrowAngle), y - arrowLength * Math.sin(angle - arrowAngle));
      ctx.lineTo(x - arrowLength * Math.cos(angle + arrowAngle), y - arrowLength * Math.sin(angle + arrowAngle));
      ctx.closePath();
      ctx.fill();
    }

    function drawEdge(edge: GraphEdge) {
      if (!ctx) return;
      const { from, to, weight } = edge;
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const startX = from.x + from.radius * Math.cos(angle);
      const startY = from.y + from.radius * Math.sin(angle);
      const endX = to.x - to.radius * Math.cos(angle);
      const endY = to.y - to.radius * Math.sin(angle);

      const opacity = Math.min(0.3 + (weight / 100) * 0.7, 1);
      const lineWidth = 1 + (weight / 100) * 3;

      ctx.strokeStyle = `rgba(${EDGE_COLOR}, ${opacity})`;
      ctx.lineWidth = lineWidth;

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const offset = 20;
      const controlX = midX + offset * Math.cos(angle + Math.PI / 2);
      const controlY = midY + offset * Math.sin(angle + Math.PI / 2);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.stroke();

      drawArrowHead(endX, endY, angle, lineWidth);
    }

    function drawNode(node: GraphNode) {
      if (!ctx) return;
      const isHovered = hoveredRef.current === node;
      const isSelected = selectedRef.current === node;

      if (isHovered || isSelected) {
        const glow = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius + 20);
        glow.addColorStop(0, 'rgba(124, 92, 252, 0.5)');
        glow.addColorStop(1, 'rgba(124, 92, 252, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 20, 0, Math.PI * 2);
        ctx.fill();
      }

      const color = CHORD_FUNCTION_COLORS[node.function] || CHORD_FUNCTION_COLORS.default;
      const gradient = ctx.createRadialGradient(node.x - 10, node.y - 10, 0, node.x, node.y, node.radius);
      gradient.addColorStop(0, lightenColor(color, 30));
      gradient.addColorStop(1, color);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isHovered || isSelected ? '#ffffff' : lightenColor(color, 20);
      ctx.lineWidth = isHovered || isSelected ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSizeFor(node.name)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, node.x, node.y);
    }

    function render() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      edgesRef.current.forEach(drawEdge);
      nodesRef.current.forEach(drawNode);
    }

    function resize() {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = height;
      calculateLayout();
      render();
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hoveredRef.current = getNodeAtPosition(x, y);
      canvas.style.cursor = hoveredRef.current ? 'pointer' : 'default';
      render();
    }

    function handleClick(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const clicked = getNodeAtPosition(x, y);
      if (clicked) {
        selectedRef.current = clicked;
        onNodeClickRef.current?.(clicked.id, clicked.name);
        render();
      }
    }

    function handleMouseLeave() {
      hoveredRef.current = null;
      render();
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [graph, translateFunc, height]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-surface-line">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
