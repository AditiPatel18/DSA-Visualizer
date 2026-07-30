class GraphVisualizer {
    constructor() {
        this.algorithm = document.body.dataset.algorithm || 'bfs';
        this.nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
        this.edges = [
            ['A', 'B', 4],
            ['A', 'C', 2],
            ['B', 'D', 5],
            ['C', 'D', 1],
            ['C', 'E', 6],
            ['D', 'F', 3],
            ['E', 'F', 2]
        ];
        this.visited = new Set();
        this.distance = {};
        this.currentNode = null;
        this.isRunning = false;
        this.stats = { visited: 0, edges: this.edges.length, distance: 0 };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateStats();
        this.updateStatus('Ready to start');
    }

    bindEvents() {
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const stepBtn = document.getElementById('stepBtn');

        if (startBtn) startBtn.addEventListener('click', () => this.run());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (stepBtn) stepBtn.addEventListener('click', () => this.step());
    }

    render() {
        const svg = document.getElementById('graphSvg');
        if (!svg) return;
        svg.innerHTML = '';

        const positions = {
            A: { x: 70, y: 190 },
            B: { x: 220, y: 90 },
            C: { x: 220, y: 290 },
            D: { x: 380, y: 190 },
            E: { x: 540, y: 290 },
            F: { x: 540, y: 90 }
        };

        this.edges.forEach(([from, to, weight]) => {
            const fromPos = positions[from];
            const toPos = positions[to];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromPos.x);
            line.setAttribute('y1', fromPos.y);
            line.setAttribute('x2', toPos.x);
            line.setAttribute('y2', toPos.y);
            line.setAttribute('class', 'graph-edge');
            line.dataset.from = from;
            line.dataset.to = to;
            svg.appendChild(line);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', (fromPos.x + toPos.x) / 2);
            label.setAttribute('y', (fromPos.y + toPos.y) / 2 - 10);
            label.setAttribute('class', 'graph-label');
            label.textContent = weight;
            svg.appendChild(label);
        });

        this.nodes.forEach((node) => {
            const pos = positions[node];
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x);
            circle.setAttribute('cy', pos.y);
            circle.setAttribute('r', 24);
            circle.setAttribute('class', 'graph-node');
            circle.dataset.node = node;
            svg.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y + 5);
            text.setAttribute('class', 'graph-label');
            text.textContent = node;
            svg.appendChild(text);
        });
    }

    reset() {
        this.isRunning = false;
        this.visited = new Set();
        this.distance = { A: 0 };
        this.currentNode = 'A';
        this.stats = { visited: 0, edges: this.edges.length, distance: 0 };
        this.render();
        this.updateStats();
        this.updateStatus('Ready to start');
    }

    async run() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.reset();

        if (this.algorithm === 'bfs') {
            await this.runBfs();
        } else if (this.algorithm === 'dfs') {
            await this.runDfs();
        } else if (this.algorithm === 'dijkstra') {
            await this.runDijkstra();
        } else if (this.algorithm === 'bellmanford') {
            await this.runBellmanFord();
        } else if (this.algorithm === 'prim') {
            await this.runPrim();
        } else if (this.algorithm === 'kruskal') {
            await this.runKruskal();
        } else {
            await this.runGenericGraphAlgo();
        }

        this.isRunning = false;
    }

    async runBfs() {
        const queue = ['A'];
        const discovered = new Set(['A']);
        this.distance = { A: 0 };
        this.updateStatus('Starting BFS from A');

        while (queue.length) {
            const node = queue.shift();
            this.currentNode = node;
            this.visited.add(node);
            this.stats.visited = this.visited.size;
            this.highlightNode(node, 'current');
            await this.delay();
            for (const [from, to, weight] of this.edges) {
                if (from === node && !discovered.has(to)) {
                    discovered.add(to);
                    queue.push(to);
                    this.distance[to] = this.distance[node] + weight;
                    this.highlightEdge(from, to, 'active');
                    await this.delay();
                }
            }
            this.highlightNode(node, 'visited');
            this.updateStats();
        }

        this.updateStatus('BFS finished');
        this.updateStats();
    }

    async runDfs() {
        const stack = ['A'];
        const visited = new Set();
        this.updateStatus('Starting DFS from A');

        while (stack.length) {
            const node = stack.pop();
            if (visited.has(node)) continue;
            visited.add(node);
            this.visited.add(node);
            this.currentNode = node;
            this.stats.visited = this.visited.size;
            this.highlightNode(node, 'current');
            await this.delay();
            for (const [from, to] of this.edges) {
                if (from === node && !visited.has(to)) {
                    stack.push(to);
                    this.highlightEdge(from, to, 'active');
                    await this.delay();
                }
            }
            this.highlightNode(node, 'visited');
            this.updateStats();
        }

        this.updateStatus('DFS finished');
    }

    async runDijkstra() {
        const distances = { A: 0 };
        const unvisited = new Set(this.nodes);
        this.updateStatus('Running Dijkstra from A');

        while (unvisited.size) {
            let current = null;
            let best = Infinity;
            for (const node of unvisited) {
                if (distances[node] !== undefined && distances[node] < best) {
                    best = distances[node];
                    current = node;
                }
            }
            if (current === null) break;
            unvisited.delete(current);
            this.visited.add(current);
            this.currentNode = current;
            this.stats.visited = this.visited.size;
            this.highlightNode(current, 'current');
            await this.delay();
            for (const [from, to, weight] of this.edges) {
                if (from === current) {
                    const candidate = distances[current] + weight;
                    if (distances[to] === undefined || candidate < distances[to]) {
                        distances[to] = candidate;
                        this.highlightEdge(from, to, 'selected');
                        await this.delay();
                    }
                }
            }
            this.highlightNode(current, 'visited');
            this.updateStats();
        }

        this.distance = distances;
        this.updateStatus('Dijkstra finished');
    }

    async runBellmanFord() {
        this.updateStatus('Relaxing edges for Bellman-Ford');
        const distances = { A: 0 };
        this.nodes.forEach((node) => { if (node !== 'A') distances[node] = Infinity; });

        for (let i = 0; i < this.nodes.length - 1; i++) {
            for (const [from, to, weight] of this.edges) {
                if (distances[from] !== Infinity && distances[from] + weight < (distances[to] ?? Infinity)) {
                    distances[to] = distances[from] + weight;
                    this.highlightEdge(from, to, 'selected');
                    await this.delay();
                }
            }
        }

        this.distance = distances;
        this.updateStatus('Bellman-Ford completed');
    }

    async runPrim() {
        this.updateStatus('Growing the minimum spanning tree');
        const tree = new Set(['A']);
        this.visited.add('A');
        this.stats.visited = tree.size;
        this.highlightNode('A', 'current');
        await this.delay();

        while (tree.size < this.nodes.length) {
            let bestEdge = null;
            for (const [from, to, weight] of this.edges) {
                const inTree = tree.has(from);
                const outTree = tree.has(to);
                if (inTree !== outTree && (!bestEdge || weight < bestEdge[2])) {
                    bestEdge = [from, to, weight];
                }
            }
            if (!bestEdge) break;
            const [from, to] = bestEdge;
            tree.add(to);
            this.visited.add(to);
            this.highlightNode(to, 'selected');
            this.highlightEdge(from, to, 'selected');
            this.stats.visited = tree.size;
            this.updateStats();
            await this.delay();
        }

        this.updateStatus('Prim finished');
    }

    async runKruskal() {
        this.updateStatus('Selecting edges for Kruskal MST');
        const sorted = [...this.edges].sort((a, b) => a[2] - b[2]);
        const parents = {};
        this.nodes.forEach((node) => { parents[node] = node; });
        const find = (node) => (parents[node] === node ? node : find(parents[node]));
        const union = (a, b) => { const ra = find(a); const rb = find(b); if (ra !== rb) parents[rb] = ra; };

        for (const [from, to, weight] of sorted) {
            if (find(from) !== find(to)) {
                union(from, to);
                this.visited.add(from);
                this.visited.add(to);
                this.highlightEdge(from, to, 'selected');
                this.stats.visited = this.visited.size;
                this.updateStats();
                await this.delay();
            }
        }

        this.updateStatus('Kruskal finished');
    }

    async runGenericGraphAlgo() {
        this.updateStatus(`Running ${this.algorithm.toUpperCase()} algorithm...`);
        for (const node of this.nodes) {
            this.currentNode = node;
            this.visited.add(node);
            this.stats.visited = this.visited.size;
            this.highlightNode(node, 'current');
            await this.delay();
            for (const [from, to] of this.edges) {
                if (from === node) {
                    this.highlightEdge(from, to, 'selected');
                    await this.delay(200);
                }
            }
            this.highlightNode(node, 'visited');
            this.updateStats();
        }
        this.updateStatus(`${this.algorithm.toUpperCase()} completed.`);
    }

    step() {
        if (!this.isRunning) {
            this.run();
        }
    }

    highlightNode(node, state) {
        const target = document.querySelector(`.graph-node[data-node="${node}"]`);
        if (target) {
            target.classList.remove('visited', 'current', 'selected');
            target.classList.add(state);
        }
    }

    highlightEdge(from, to, state) {
        const edges = document.querySelectorAll('.graph-edge');
        edges.forEach((edge) => {
            if (edge.dataset.from === from && edge.dataset.to === to) {
                edge.classList.remove('active', 'selected');
                edge.classList.add(state);
            }
        });
    }

    updateStats() {
        const visitedCount = document.getElementById('visitedCount');
        const edgeCount = document.getElementById('edgeCount');
        if (visitedCount) visitedCount.textContent = this.stats.visited;
        if (edgeCount) edgeCount.textContent = this.edges.length;

        const distanceValue = document.getElementById('distanceValue');
        if (distanceValue) {
            distanceValue.textContent = this.algorithm === 'dijkstra' || this.algorithm === 'bellmanford' ? `${this.distance.A ?? 0}` : '—';
        }
    }

    updateStatus(text) {
        const status = document.getElementById('statusValue');
        if (status) status.textContent = text;
    }

    delay(ms = 450) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GraphVisualizer();
});
