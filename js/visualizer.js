class SortingVisualizer {
    constructor() {
        this.array = [];
        this.arraySize = 20;
        this.speed = 50;
        this.isSorting = false;
        this.isPaused = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.startTime = 0;
        this.operations = 0;
        this.animationQueue = [];
        this.currentAnimation = null;
        
        this.init();
    }
    
    init() {
        this.generateNewArray();
        this.renderArray();
        this.setupEventListeners();
    }
    
    generateNewArray() {
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push(Math.floor(Math.random() * 400) + 50);
        }
        this.resetStats();
        this.renderArray();
    }
    
    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.operations = 0;
        this.startTime = 0;
        this.updateStats();
    }
    
    renderArray() {
        const container = document.getElementById('arrayDisplay');
        container.innerHTML = '';
        
        const maxHeight = Math.max(...this.array);
        const containerHeight = 300;
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${(value / maxHeight) * containerHeight}px`;
            bar.style.width = `${100 / this.arraySize}%`;
            bar.dataset.index = index;
            bar.dataset.value = value;
            
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = value;
            bar.appendChild(label);
            
            container.appendChild(bar);
        });
    }
    
    setupEventListeners() {
        // Array size slider
        const sizeSlider = document.getElementById('arraySize');
        const sizeValue = document.getElementById('sizeValue');
        
        sizeSlider.addEventListener('input', () => {
            this.arraySize = parseInt(sizeSlider.value);
            sizeValue.textContent = this.arraySize;
            this.generateNewArray();
        });
        
        // Speed slider
        const speedSlider = document.getElementById('animationSpeed');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', () => {
            this.speed = parseInt(speedSlider.value);
            const speedText = this.speed < 33 ? 'Slow' : this.speed < 66 ? 'Normal' : 'Fast';
            speedValue.textContent = speedText;
        });
        
        // Control buttons
        document.getElementById('generateBtn').addEventListener('click', () => {
            if (!this.isSorting) {
                this.generateNewArray();
            }
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            if (!this.isSorting) {
                this.startSorting();
            } else if (this.isPaused) {
                this.resumeSorting();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.isSorting && !this.isPaused) {
                this.pauseSorting();
            }
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSorting();
        });
    }
    
    async startSorting() {
        if (this.isSorting) return;
        
        this.isSorting = true;
        this.isPaused = false;
        this.startTime = Date.now();
        
        // Disable controls
        this.toggleControls(true);
        
        // Perform quick sort
        await this.quickSort(0, this.array.length - 1);
        
        // Mark all as sorted
        await this.markAllSorted();
        
        // Re-enable controls
        this.toggleControls(false);
        this.isSorting = false;
        
        // Update final time
        this.updateStats();
    }
    
    async quickSort(low, high) {
        if (low < high && this.isSorting && !this.isPaused) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }
    
    async partition(low, high) {
        const pivot = this.array[high];
        
        // Highlight pivot
        await this.highlightBar(high, 'pivot');
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (!this.isSorting || this.isPaused) return i + 1;
            
            // Highlight comparing bars
            await this.highlightBar(j, 'comparing');
            await this.highlightBar(high, 'pivot');
            
            this.comparisons++;
            this.operations++;
            this.updateStats();
            
            if (this.array[j] < pivot) {
                i++;
                
                if (i !== j) {
                    // Highlight swapping bars
                    await this.highlightBar(i, 'swapping');
                    await this.highlightBar(j, 'swapping');
                    
                    // Swap elements
                    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                    this.swaps++;
                    this.operations++;
                    
                    // Update visualization
                    await this.swapBars(i, j);
                    
                    // Reset colors
                    await this.resetBarColor(i);
                    await this.resetBarColor(j);
                }
            }
            
            // Reset comparing color
            await this.resetBarColor(j);
        }
        
        // Swap pivot to correct position
        if (i + 1 !== high) {
            await this.highlightBar(i + 1, 'swapping');
            await this.highlightBar(high, 'pivot');
            
            [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
            this.swaps++;
            this.operations++;
            
            await this.swapBars(i + 1, high);
        }
        
        // Mark pivot as sorted
        await this.markBarSorted(i + 1);
        
        // Reset pivot color
        await this.resetBarColor(high);
        
        return i + 1;
    }
    
    async highlightBar(index, type) {
        return new Promise(resolve => {
            const bar = document.querySelector(`.array-bar[data-index="${index}"]`);
            if (bar) {
                bar.classList.add(type);
                setTimeout(resolve, 1000 / this.speed);
            } else {
                resolve();
            }
        });
    }
    
    async resetBarColor(index) {
        const bar = document.querySelector(`.array-bar[data-index="${index}"]`);
        if (bar) {
            bar.classList.remove('comparing', 'swapping', 'pivot');
        }
        return Promise.resolve();
    }
    
    async markBarSorted(index) {
        const bar = document.querySelector(`.array-bar[data-index="${index}"]`);
        if (bar) {
            bar.classList.add('sorted');
        }
        return Promise.resolve();
    }
    
    async markAllSorted() {
        const bars = document.querySelectorAll('.array-bar');
        for (let i = 0; i < bars.length; i++) {
            await this.markBarSorted(i);
            await this.sleep(50 / this.speed);
        }
    }
    
    async swapBars(i, j) {
        return new Promise(resolve => {
            const bars = document.querySelectorAll('.array-bar');
            const barI = bars[i];
            const barJ = bars[j];
            
            // Swap in DOM
            const tempHeight = barI.style.height;
            barI.style.height = barJ.style.height;
            barJ.style.height = tempHeight;
            
            // Update labels
            const tempValue = barI.dataset.value;
            barI.dataset.value = barJ.dataset.value;
            barJ.dataset.value = tempValue;
            barI.querySelector('.bar-label').textContent = barJ.dataset.value;
            barJ.querySelector('.bar-label').textContent = tempValue;
            
            setTimeout(resolve, 1000 / this.speed);
        });
    }
    
    pauseSorting() {
        this.isPaused = true;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> Resume';
    }
    
    resumeSorting() {
        this.isPaused = false;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> Start Sort';
    }
    
    resetSorting() {
        this.isSorting = false;
        this.isPaused = false;
        this.generateNewArray();
        this.toggleControls(false);
        document.getElementById('startBtn').innerHTML = '<i class="fas fa-play"></i> Start Sort';
        document.getElementById('pauseBtn').disabled = true;
    }
    
    toggleControls(sorting) {
        const generateBtn = document.getElementById('generateBtn');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        generateBtn.disabled = sorting;
        startBtn.disabled = sorting && !this.isPaused;
        pauseBtn.disabled = !sorting || this.isPaused;
    }
    
    updateStats() {
        const timeElapsed = this.startTime ? Date.now() - this.startTime : 0;
        
        document.getElementById('comparisonCount').textContent = this.comparisons;
        document.getElementById('swapCount').textContent = this.swaps;
        document.getElementById('timeCount').textContent = `${timeElapsed}ms`;
        document.getElementById('opCount').textContent = this.operations;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize visualizer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});