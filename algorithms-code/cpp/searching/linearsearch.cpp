// algorithms-code/cpp/searching/linear_search.cpp
#include <iostream>
#include <vector>
#include <chrono>
using namespace std;
using namespace std::chrono;

class LinearSearch {
private:
    int comparisons;
    int steps;
    
public:
    LinearSearch() : comparisons(0), steps(0) {}
    
    // Basic linear search
    int search(const vector<int>& arr, int target) {
        comparisons = 0;
        steps = 0;
        
        for (size_t i = 0; i < arr.size(); i++) {
            steps++;
            comparisons++;
            
            cout << "Step " << steps << ": Checking index " << i 
                 << " (value: " << arr[i] << ")" << endl;
            
            if (arr[i] == target) {
                cout << "Found! Total steps: " << steps 
                     << ", Comparisons: " << comparisons << endl;
                return i;
            }
        }
        
        cout << "Not found! Total steps: " << steps 
             << ", Comparisons: " << comparisons << endl;
        return -1;
    }
    
    // Linear search with sentinel (optimized)
    int searchWithSentinel(vector<int>& arr, int target) {
        comparisons = 0;
        steps = 0;
        
        // Add sentinel at the end
        int n = arr.size();
        arr.push_back(target);
        
        int i = 0;
        while (arr[i] != target) {
            steps++;
            comparisons++;
            i++;
        }
        
        // Remove sentinel
        arr.pop_back();
        
        if (i < n) {
            cout << "Found at index " << i 
                 << " (with sentinel optimization)" << endl;
            return i;
        } else {
            cout << "Not found (with sentinel optimization)" << endl;
            return -1;
        }
    }
    
    // Get statistics
    int getComparisons() const { return comparisons; }
    int getSteps() const { return steps; }
    
    // Generate test array
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
    LinearSearch searcher;
    
    cout << "=== Linear Search in C++ ===\n\n";
    
    // Test Case 1: Small array
    vector<int> arr1 = {64, 34, 25, 12, 22, 11, 90};
    int target1 = 22;
    
    cout << "Test 1: Small Array\n";
    cout << "Array: ";
    for (int num : arr1) cout << num << " ";
    cout << "\nTarget: " << target1 << "\n\n";
    
    auto start = high_resolution_clock::now();
    int result1 = searcher.search(arr1, target1);
    auto stop = high_resolution_clock::now();
    auto duration = duration_cast<microseconds>(stop - start);
    
    cout << "Result: Index " << result1 << endl;
    cout << "Time taken: " << duration.count() << " microseconds\n\n";
    
    // Test Case 2: Larger array with sentinel
    vector<int> arr2 = searcher.generateRandomArray(20, 1, 50);
    int target2 = 25;
    
    cout << "Test 2: Random Array (size 20)\n";
    cout << "Target: " << target2 << "\n\n";
    
    cout << "--- With Sentinel Optimization ---\n";
    start = high_resolution_clock::now();
    int result2 = searcher.searchWithSentinel(arr2, target2);
    stop = high_resolution_clock::now();
    duration = duration_cast<microseconds>(stop - start);
    
    cout << "Result: Index " << result2 << endl;
    cout << "Time taken: " << duration.count() << " microseconds\n";
    
    return 0;
}