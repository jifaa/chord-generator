/**
 * ============================================
 * GRAPH RENDERER - Visualisasi Graf Akor dengan Canvas
 * ============================================
 */

class GraphRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.hoveredNode = null;
        this.selectedNode = null;
        this.onNodeClick = null;
        
        // Warna untuk fungsi chord
        this.colors = {
            tonic: '#22c55e',
            subdominant: '#3b82f6',
            dominant: '#ef4444',
            minor: '#a855f7',
            seventh: '#f59e0b',
            default: '#64748b'
        };
        
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        // Set ukuran canvas
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = 500;
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth - 40;
            this.render();
        });
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.hoveredNode = this.getNodeAtPosition(x, y);
            this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
            this.render();
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedNode = this.getNodeAtPosition(x, y);
            if (clickedNode) {
                this.selectedNode = clickedNode;
                if (this.onNodeClick) {
                    this.onNodeClick(clickedNode);
                }
                this.render();
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredNode = null;
            this.render();
        });
    }

    getNodeAtPosition(x, y) {
        for (const node of this.nodes) {
            const dx = x - node.x;
            const dy = y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= node.radius) {
                return node;
            }
        }
        return null;
    }

    // Buat layout graf menggunakan force-directed layout sederhana
    calculateLayout(graph) {
        const chordNames = Object.keys(graph);
        const nodeCount = chordNames.length;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 80;
        
        this.nodes = [];
        this.edges = [];
        
        // Posisikan nodes dalam lingkaran
        chordNames.forEach((chord, index) => {
            const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            this.nodes.push({
                id: chord,
                name: chord,
                x: x,
                y: y,
                radius: 35,
                function: graph[chord].function || 'default'
            });
        });
        
        // Buat edges dari adjacency list
        chordNames.forEach(fromChord => {
            const targets = graph[fromChord].targets;
            const weights = graph[fromChord].weights;
            
            targets.forEach((toChord, idx) => {
                const fromNode = this.nodes.find(n => n.id === fromChord);
                const toNode = this.nodes.find(n => n.id === toChord);
                
                if (fromNode && toNode) {
                    this.edges.push({
                        from: fromNode,
                        to: toNode,
                        weight: weights ? weights[idx] : 50
                    });
                }
            });
        });
    }

    // Render graf ke canvas
    render() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid pattern
        this.drawGrid();
        
        // Draw edges
        this.edges.forEach(edge => {
            this.drawEdge(edge);
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            this.drawNode(node);
        });
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        
        const gridSize = 40;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawEdge(edge) {
        const ctx = this.ctx;
        const { from, to, weight } = edge;
        
        // Hitung titik awal dan akhir (dari tepi lingkaran, bukan pusat)
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const startX = from.x + from.radius * Math.cos(angle);
        const startY = from.y + from.radius * Math.sin(angle);
        const endX = to.x - to.radius * Math.cos(angle);
        const endY = to.y - to.radius * Math.sin(angle);
        
        // Opacity berdasarkan weight
        const opacity = Math.min(0.3 + (weight / 100) * 0.7, 1);
        
        // Ketebalan garis berdasarkan weight
        const lineWidth = 1 + (weight / 100) * 3;
        
        // Warna edge
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
        ctx.lineWidth = lineWidth;
        
        // Draw curved line (bezier untuk visual yang lebih bagus)
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const offset = 20;
        const controlX = midX + offset * Math.cos(angle + Math.PI / 2);
        const controlY = midY + offset * Math.sin(angle + Math.PI / 2);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();
        
        // Draw arrow head
        this.drawArrowHead(endX, endY, angle, lineWidth);
        
        // Draw weight label jika weight besar
        if (weight >= 30) {
            this.drawWeightLabel(midX, midY, weight);
        }
    }

    drawArrowHead(x, y, angle, lineWidth) {
        const ctx = this.ctx;
        const arrowLength = 12 + lineWidth;
        const arrowAngle = Math.PI / 6;
        
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - arrowLength * Math.cos(angle - arrowAngle),
            y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
            x - arrowLength * Math.cos(angle + arrowAngle),
            y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.closePath();
        ctx.fill();
    }

    drawWeightLabel(x, y, weight) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${weight}%`, x, y - 5);
    }

    drawNode(node) {
        const ctx = this.ctx;
        const isHovered = this.hoveredNode === node;
        const isSelected = this.selectedNode === node;
        
        // Node glow effect jika selected atau hovered
        if (isHovered || isSelected) {
            const gradient = ctx.createRadialGradient(
                node.x, node.y, node.radius,
                node.x, node.y, node.radius + 20
            );
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 20, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Node background
        const color = this.colors[node.function] || this.colors.default;
        const gradient = ctx.createRadialGradient(
            node.x - 10, node.y - 10, 0,
            node.x, node.y, node.radius
        );
        gradient.addColorStop(0, this.lightenColor(color, 30));
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = isHovered || isSelected ? '#ffffff' : this.lightenColor(color, 20);
        ctx.lineWidth = isHovered || isSelected ? 3 : 2;
        ctx.stroke();
        
        // Node label
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${this.getFontSize(node.name)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.name, node.x, node.y);
    }

    getFontSize(text) {
        if (text.length <= 2) return 16;
        if (text.length <= 4) return 14;
        if (text.length <= 6) return 12;
        return 10;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    // Update graph dengan data baru
    updateGraph(graphData) {
        this.calculateLayout(graphData);
        this.render();
    }

    // Set callback untuk click event
    setOnNodeClick(callback) {
        this.onNodeClick = callback;
    }

    // Highlight node tertentu
    highlightNode(nodeId) {
        this.selectedNode = this.nodes.find(n => n.id === nodeId);
        this.render();
    }

    // Clear highlight
    clearHighlight() {
        this.selectedNode = null;
        this.render();
    }
}

// Export untuk digunakan di file lain
window.GraphRenderer = GraphRenderer;
