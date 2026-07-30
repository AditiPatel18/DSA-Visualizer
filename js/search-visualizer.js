class SearchingVisualizer {
    constructor() {
        this.array = [];
        this.arraySize = 20;
        this.speed = 60;
        this.algorithm = 'binary';
        this.isRunning = false;
        this.isPaused = false;
        this.comparisons = 0;
        this.startTime = 0;
        this.currentIndex = -1;
        this.searchResult = 'Not searched';
        this.animationTimer = null;

        this.init();
    }

    init() {
        this.generateArray();
        this.renderArray();
        this.bindEvents();
        this.updateStats();
    }

    generateArray() {
        if (this.isRunning) return;

        const size = this.arraySize;
        const values = [];

        let current = Math.floor(Math.random() * 40) + 20;
        for (let i = 0; i < size; i++) {
            current += Math.floor(Math.random() * 20) + 8;
            values.push(current);
        }

        this.array = values;
        this.comparisons = 0;
        this.currentIndex = -1;
        this.searchResult = 'Not searched';
        this.startTime = 0;
        this.renderArray();
        this.updateStats();
    }

    bindEvents() {
        const sizeSlider = document.getElementById('arraySize');
        const sizeValue = document.getElementById('sizeValue');
        const speedSlider = document.getElementById('animationSpeed');
        const speedValue = document.getElementById('speedValue');
        const algorithmSelect = document.getElementById('algorithmSelect');
        const searchValueInput = document.getElementById('searchValue');

        sizeSlider.addEventListener('input', () => {
            this.arraySize = Number(sizeSlider.value);
            sizeValue.textContent = this.arraySize;
            this.generateArray();
        });

        speedSlider.addEventListener('input', () => {
            this.speed = Number(speedSlider.value);
            speedValue.textContent = this.speed < 40 ? 'Slow' : this.speed < 80 ? 'Normal' : 'Fast';
        });

        algorithmSelect.addEventListener('change', () => {
            this.algorithm = algorithmSelect.value;
        });

        searchValueInput.addEventListener('input', () => {
            if (!this.isRunning) {
                this.updateStats();
            }
        });

        document.getElementById('generateBtn').addEventListener('click', () => this.generateArray());
        document.getElementById('startBtn').addEventListener('click', () => this.startSearch());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseSearch());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSearch());
    }

    renderArray() {
        const container = document.getElementById('searchArrayDisplay');
        if (!container) return;

        container.innerHTML = '';
        const maxHeight = Math.max(...this.array);
        const maxBarHeight = 220;

        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'search-array-bar';
            bar.dataset.index = index;
            bar.style.height = `${(value / maxHeight) * maxBarHeight}px`;
            const label = document.createElement('span');
            label.className = 'bar-value';
            label.textContent = value;
            bar.appendChild(label);
            container.appendChild(bar);
        });
    }

    async startSearch() {
        if (this.isRunning && !this.isPaused) return;
        if (this.isPaused) {
            this.resumeSearch();
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.comparisons = 0;
        this.currentIndex = -1;
        this.searchResult = 'Searching...';
        this.clearHighlights();
        this.updateStats();
        this.setButtons(true);

        const target = Number(document.getElementById('searchValue').value);

        try {
            if (this.algorithm === 'linear') {
                await this.linearSearch(target);
            } else if (this.algorithm === 'binary') {
                await this.binarySearch(target);
            } else if (this.algorithm === 'lowerbound') {
                await this.lowerBound(target);
            } else if (this.algorithm === 'upperbound') {
                await this.upperBound(target);
            } else {
                await this.jumpSearch(target);
            }
        } catch (error) {
            this.searchResult = 'Interrupted';
        }

        this.isRunning = false;
        this.isPaused = false;
        this.updateStats();
        this.setButtons(false);
    }

    async linearSearch(target) {
        for (let i = 0; i < this.array.length; i++) {
            await this.waitForResume();
            this.highlight(i, 'active');
            this.currentIndex = i;
            this.comparisons += 1;
            this.updateStats();
            await this.delay();

            if (this.array[i] === target) {
                this.highlight(i, 'success');
                this.searchResult = `Found at index ${i}`;
                this.currentIndex = i;
                this.updateStats();
                return;
            }

            this.highlight(i, 'checked');
        }

        this.searchResult = 'Not found';
        this.currentIndex = -1;
        this.updateStats();
    }

    async binarySearch(target) {
        let left = 0;
        let right = this.array.length - 1;

        while (left <= right) {
            await this.waitForResume();
            const mid = Math.floor((left + right) / 2);
            this.highlight(mid, 'active');
            this.currentIndex = mid;
            this.comparisons += 1;
            this.updateStats();
            await this.delay();

            if (this.array[mid] === target) {
                this.highlight(mid, 'success');
                this.searchResult = `Found at index ${mid}`;
                this.currentIndex = mid;
                this.updateStats();
                return;
            }

            this.highlight(mid, 'checked');
            if (this.array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        this.searchResult = 'Not found';
        this.currentIndex = -1;
        this.updateStats();
    }

    async jumpSearch(target) {
        const length = this.array.length;
        let step = Math.floor(Math.sqrt(length));
        let prev = 0;

        while (prev < length && this.array[Math.min(step, length) - 1] < target) {
            await this.waitForResume();
            this.highlight(Math.min(step, length) - 1, 'active');
            this.currentIndex = Math.min(step, length) - 1;
            this.comparisons += 1;
            this.updateStats();
            await this.delay();
            this.highlight(Math.min(step, length) - 1, 'checked');
            prev = step;
            step += Math.floor(Math.sqrt(length));
        }

        for (let i = prev; i < Math.min(step, length); i++) {
            await this.waitForResume();
            this.highlight(i, 'active');
            this.currentIndex = i;
            this.comparisons += 1;
            this.updateStats();
            await this.delay();

            if (this.array[i] === target) {
                this.highlight(i, 'success');
                this.searchResult = `Found at index ${i}`;
                this.currentIndex = i;
                this.updateStats();
                return;
            }
            this.highlight(i, 'checked');
        }

        this.searchResult = 'Not found';
        this.currentIndex = -1;
        this.updateStats();
    }

    async lowerBound(target) {
        let left = 0;
        let right = this.array.length - 1;
        let ans = this.array.length;

        while (left <= right) {
            await this.waitForResume();
            const mid = Math.floor((left + right) / 2);
            this.highlight(mid, 'active');
            this.currentIndex = mid;
            this.comparisons += 1;
            this.updateStats();
            await this.delay();

            if (this.array[mid] >= target) {
                ans = mid;
                this.highlight(mid, 'success');
                right = mid - 1;
            } else {
                this.highlight(mid, 'checked');
                left = mid + 1;
            }
        }

        this.currentIndex = ans;
        this.searchResult = ans < this.array.length ? `Lower Bound at index ${ans}` : `Lower Bound at index ${ans} (end of array)`;
        this.updateStats();
    }

    async upperBound(target) {
        let left = 0;
        let right = this.array.length - 1;
        let ans = this.array.length;

        while (left <= right) {
            await this.waitForResume();
            const mid = Math.floor((left + right) / 2);
            this.highlight(mid, 'active');
            this.currentIndex = mid;
            this.comparisons += 1;
            this.updateStats();
            await this.delay();

            if (this.array[mid] > target) {
                ans = mid;
                this.highlight(mid, 'success');
                right = mid - 1;
            } else {
                this.highlight(mid, 'checked');
                left = mid + 1;
            }
        }

        this.currentIndex = ans;
        this.searchResult = ans < this.array.length ? `Upper Bound at index ${ans}` : `Upper Bound at index ${ans} (end of array)`;
        this.updateStats();
    }

    pauseSearch() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('startBtn').textContent = 'Resume';
        }
    }

    resumeSearch() {
        this.isPaused = false;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('startBtn').textContent = 'Searching...';
    }

    resetSearch() {
        this.isRunning = false;
        this.isPaused = false;
        this.clearHighlights();
        this.generateArray();
        this.setButtons(false);
        document.getElementById('startBtn').textContent = 'Start Search';
        document.getElementById('pauseBtn').disabled = true;
    }

    setButtons(running) {
        document.getElementById('generateBtn').disabled = running;
        document.getElementById('startBtn').textContent = running ? 'Searching...' : 'Start Search';
        document.getElementById('pauseBtn').disabled = !running;
        document.getElementById('resetBtn').disabled = false;
    }

    updateStats() {
        const elapsed = this.startTime ? `${Date.now() - this.startTime}ms` : '0ms';
        document.getElementById('currentIndex').textContent = this.currentIndex >= 0 ? this.currentIndex : '—';
        document.getElementById('comparisonCount').textContent = this.comparisons;
        document.getElementById('timeCount').textContent = elapsed;
        document.getElementById('searchResult').textContent = this.searchResult;
    }

    clearHighlights() {
        document.querySelectorAll('.search-array-bar').forEach((bar) => {
            bar.classList.remove('active', 'checked', 'success', 'failure');
        });
    }

    highlight(index, state) {
        const bar = document.querySelector(`.search-array-bar[data-index="${index}"]`);
        if (bar) {
            bar.classList.remove('active', 'checked', 'success', 'failure');
            bar.classList.add(state);
        }
    }

    async waitForResume() {
        while (this.isPaused && this.isRunning) {
            await this.delay(60);
        }
    }

    delay(ms = 90 - this.speed / 2) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SearchingVisualizer();
});
