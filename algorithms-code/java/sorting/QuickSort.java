package sorting;

public class QuickSort {
    private int comparisons = 0;
    private int swaps = 0;
    
    // Partition method
    private int partition(int[] arr, int low, int high) {
        // Choose last element as pivot
        int pivot = arr[high];
        
        // Index of smaller element
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            comparisons++;
            // If current element is smaller than pivot
            if (arr[j] < pivot) {
                i++;
                
                // Swap arr[i] and arr[j]
                swap(arr, i, j);
            }
        }
        
        // Swap arr[i+1] and arr[high] (pivot)
        swap(arr, i + 1, high);
        
        return i + 1;
    }
    
    // QuickSort recursive method
    private void quickSortHelper(int[] arr, int low, int high) {
        if (low < high) {
            // Partition index
            int pi = partition(arr, low, high);
            
            // Recursively sort elements before and after partition
            quickSortHelper(arr, low, pi - 1);
            quickSortHelper(arr, pi + 1, high);
        }
    }
    
    // Swap helper method
    private void swap(int[] arr, int i, int j) {
        swaps++;
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    // Public sort method
    public void sort(int[] arr) {
        comparisons = 0;
        swaps = 0;
        quickSortHelper(arr, 0, arr.length - 1);
    }
    
    // Get statistics
    public int getComparisons() {
        return comparisons;
    }
    
    public int getSwaps() {
        return swaps;
    }
    
    // Print array
    public void printArray(int[] arr) {
        for (int value : arr) {
            System.out.print(value + " ");
        }
        System.out.println();
    }
    
    // Generate random array
    public int[] generateRandomArray(int size, int minVal, int maxVal) {
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = minVal + (int)(Math.random() * (maxVal - minVal + 1));
        }
        return arr;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        QuickSort sorter = new QuickSort();
        
        // Test case 1
        int[] arr1 = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Original array:");
        sorter.printArray(arr1);
        
        sorter.sort(arr1);
        
        System.out.println("Sorted array:");
        sorter.printArray(arr1);
        System.out.println("Comparisons: " + sorter.getComparisons());
        System.out.println("Swaps: " + sorter.getSwaps());
        System.out.println();
        
        // Test case 2: Random array
        int[] arr2 = sorter.generateRandomArray(15, 1, 100);
        System.out.println("Random array:");
        sorter.printArray(arr2);
        
        sorter.sort(arr2);
        
        System.out.println("Sorted array:");
        sorter.printArray(arr2);
        System.out.println("Comparisons: " + sorter.getComparisons());
        System.out.println("Swaps: " + sorter.getSwaps());
    }
}