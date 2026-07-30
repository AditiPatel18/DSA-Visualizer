class CodeViewer {
    constructor() {
        this.currentLanguage = 'c';
        this.codeSamples = {
            'c': '',
            'cpp': '',
            'java': ''
        };
        
        this.init();
    }
    
    async init() {
        await this.loadCodeSamples();
        this.setupEventListeners();
        this.updateLanguage('c');
    }
    
    async loadCodeSamples() {
        // In a real app, these would be loaded from files
        // For demo, we'll use hardcoded samples
        
        this.codeSamples.c = `#include <stdio.h>

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return (i + 1);
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`;

        this.codeSamples.cpp = `#include <iostream>
#include <vector>
using namespace std;

class QuickSort {
private:
    int partition(vector<int>& arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        return i + 1;
    }
    
    void quickSortHelper(vector<int>& arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSortHelper(arr, low, pi - 1);
            quickSortHelper(arr, pi + 1, high);
        }
    }
    
public:
    void sort(vector<int>& arr) {
        quickSortHelper(arr, 0, arr.size() - 1);
    }
};`;

        this.codeSamples.java = `public class QuickSort {
    
    private int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        return i + 1;
    }
    
    public void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
}`;
    }
    
    setupEventListeners() {
        // Language tabs
        document.querySelectorAll('.lang-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const lang = tab.dataset.lang;
                this.updateLanguage(lang);
            });
        });
        
        // Copy buttons
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang || this.currentLanguage;
                this.copyCode(lang, btn);
            });
        });
    }
    
    updateLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update active tab
        document.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.lang === lang) {
                tab.classList.add('active');
            }
        });
        
        // Update code display
        document.querySelectorAll('.code-container').forEach(container => {
            container.classList.remove('active');
            if (container.id === `code-${lang}`) {
                container.classList.add('active');
            }
        });
        
        // Update statistics
        this.updateLanguageStats(lang);
    }
    
    updateLanguageStats(lang) {
        const stats = {
            'c': { lines: 35, complexity: '8.5/10' },
            'cpp': { lines: 40, complexity: '8.0/10' },
            'java': { lines: 45, complexity: '7.5/10' }
        };
        
        if (stats[lang]) {
            document.getElementById('lines-count').textContent = stats[lang].lines;
            document.getElementById('complexity-score').textContent = stats[lang].complexity;
        }
    }
    
    copyCode(lang, button) {
        const code = this.codeSamples[lang];
        
        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            alert('Failed to copy code to clipboard');
        });
    }
    
    getLanguageInfo(lang) {
        const info = {
            'c': {
                name: 'C',
                icon: 'fab fa-c',
                features: ['Pointers', 'Low-level control', 'Memory management'],
                speed: 'Fastest',
                memory: 'Most efficient'
            },
            'cpp': {
                name: 'C++',
                icon: 'fab fa-cuttlefish',
                features: ['Object-oriented', 'Templates', 'STL'],
                speed: 'Fast',
                memory: 'Efficient'
            },
            'java': {
                name: 'Java',
                icon: 'fab fa-java',
                features: ['Platform independent', 'Garbage collection', 'Enterprise-ready'],
                speed: 'Moderate',
                memory: 'Higher overhead'
            }
        };
        
        return info[lang] || info.c;
    }
}

// Initialize code viewer
document.addEventListener('DOMContentLoaded', () => {
    new CodeViewer();
});