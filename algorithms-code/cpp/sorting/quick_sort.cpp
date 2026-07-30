#include <iostream>
#include <vector>
#include <algorithm>
#include <cstdlib>
#include <ctime>
using namespace std;

class QuickSort {
private:
    int comparisons = 0;
    int swaps = 0;
    
    // Partition function with last element as pivot
    int partition(vector<int>& arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            comparisons++;
            if (arr[j] < pivot) {
                i++;
                swap(arr[i], arr[j]);
                swaps++;
            }
        }
        swap(arr[i + 1], arr[high]);
        swaps++;
        return i + 1;
    }
    
    // QuickSort recursive function
    void quickSortHelper(vector<int>& arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSortHelper(arr, low, pi - 1);
            quickSortHelper(arr, pi + 1, high);
        }
    }
    
public:
    // Public sort interface
    void sort(vector<int>& arr) {
        comparisons = 0;
        swaps = 0;
        quickSortHelper(arr, 0, arr.size() - 1);
    }
    
    // Get statistics
    int getComparisons() const { return comparisons; }
    int getSwaps() const { return swaps; }
    
    // Print array
    void printArray(const vector<int>& arr) {
        for (int num : arr) {
            cout << num << " ";
        }
        cout << endl;
    }
    
    // Generate random array
    vector<int> generateRandomArray(int size, int minVal = 1, int maxVal = 100) {
        vector<int> arr(size);
        srand(time(0));
        for (int i = 0; i < size; i++) {
            arr[i] = minVal + rand() % (maxVal - minVal + 1);
        }
        return arr;
    }
};

int main() {
    QuickSort sorter;
    
    // Example 1: Small array
    vector<int> arr1 = {64, 34, 25, 12, 22, 11, 90};
    cout << "Original array: ";
    sorter.printArray(arr1);
    
    sorter.sort(arr1);
    
    cout << "Sorted array: ";
    sorter.printArray(arr1);
    cout << "Comparisons: " << sorter.getComparisons() << endl;
    cout << "Swaps: " << sorter.getSwaps() << endl;
    cout << endl;
    
    // Example 2: Random array
    vector<int> arr2 = sorter.generateRandomArray(10);
    cout << "Random array: ";
    sorter.printArray(arr2);
    
    sorter.sort(arr2);
    
    cout << "Sorted array: ";
    sorter.printArray(arr2);
    cout << "Comparisons: " << sorter.getComparisons() << endl;
    cout << "Swaps: " << sorter.getSwaps() << endl;
    
    return 0;
}