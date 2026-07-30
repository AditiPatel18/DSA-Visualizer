(function () {
    const TOTAL_PLATFORM_ALGORITHMS = 101;

    const CATEGORY_MAP = {
        // Arrays
        'kadane': { name: "Kadane's Algorithm", category: 'Arrays' },
        'pascal': { name: "Pascal's Triangle", category: 'Arrays' },
        'nextpermutation': { name: 'Next Permutation', category: 'Arrays' },
        'majorityelement': { name: 'Majority Element', category: 'Arrays' },
        'mergeintervals': { name: 'Merge Overlapping Intervals', category: 'Arrays' },
        // Sorting & Searching & Graph
        'quicksort': { name: 'Quick Sort', category: 'Sorting' },
        'mergesort': { name: 'Merge Sort', category: 'Sorting' },
        'linearsearch': { name: 'Linear Search', category: 'Searching' },
        'binarysearch': { name: 'Binary Search', category: 'Searching' },
        'lowerbound': { name: 'Lower Bound', category: 'Searching' },
        'upperbound': { name: 'Upper Bound', category: 'Searching' },
        'dijkstra': { name: "Dijkstra's Algorithm", category: 'Graph' },
        'bfs': { name: 'Breadth First Search', category: 'Graph' },
        'dfs': { name: 'Depth First Search', category: 'Graph' },
        'kruskal': { name: "Kruskal's Algorithm", category: 'Graph' },
        'prim': { name: "Prim's Algorithm", category: 'Graph' },
        'bellmanford': { name: 'Bellman-Ford Algorithm', category: 'Graph' },
        'graphrepresentation': { name: 'Graph Representation', category: 'Graph' },
        'provinces': { name: 'Number of Provinces', category: 'Graph' },
        'islands': { name: 'Number of Islands', category: 'Graph' },
        'floodfill': { name: 'Flood Fill Algorithm', category: 'Graph' },
        'rottenoranges': { name: 'Rotten Oranges', category: 'Graph' },
        'cycleundirectedbfs': { name: 'Cycle Detection Undirected (BFS)', category: 'Graph' },
        'cycleundirecteddfs': { name: 'Cycle Detection Undirected (DFS)', category: 'Graph' },
        'cycledirected': { name: 'Cycle Detection Directed', category: 'Graph' },
        'toposort': { name: 'Topological Sort (DFS)', category: 'Graph' },
        'kahns': { name: "Kahn's Algorithm (BFS Topo)", category: 'Graph' },
        'courseschedule': { name: 'Course Schedule', category: 'Graph' },
        'bipartite': { name: 'Bipartite Graph', category: 'Graph' },
        'shortestpathdag': { name: 'Shortest Path in DAG', category: 'Graph' },
        'floydwarshall': { name: 'Floyd-Warshall Algorithm', category: 'Graph' },
        'dsu': { name: 'Disjoint Set Union (DSU)', category: 'Graph' },
        'bridges': { name: 'Bridges in Graph', category: 'Graph' },
        'articulationpoints': { name: 'Articulation Points', category: 'Graph' },
        'kosaraju': { name: "Kosaraju's SCC Algorithm", category: 'Graph' },
        'tarjan': { name: "Tarjan's SCC Algorithm", category: 'Graph' },

        // Stack
        'validparentheses': { name: 'Valid Parentheses', category: 'Stack' },
        'minstack': { name: 'Min Stack', category: 'Stack' },
        'nextgreaterelement': { name: 'Next Greater Element', category: 'Stack' },
        'monotonicstack': { name: 'Monotonic Stack', category: 'Stack' },
        'histogram': { name: 'Largest Rectangle in Histogram', category: 'Stack' },

        // Queue
        'queuealgo': { name: 'Queue Data Structure', category: 'Queue' },
        'circularqueue': { name: 'Circular Queue', category: 'Queue' },
        'dequealgo': { name: 'Deque', category: 'Queue' },
        'queueusingstacks': { name: 'Queue using Stacks', category: 'Queue' },
        'stackusingqueues': { name: 'Stack using Queues', category: 'Queue' },

        // Linked List
        'singlylinkedlist': { name: 'Singly Linked List', category: 'Linked List' },
        'doublylinkedlist': { name: 'Doubly Linked List', category: 'Linked List' },
        'reverselinkedlist': { name: 'Reverse Linked List', category: 'Linked List' },
        'detectcyclell': { name: 'Detect Cycle LL', category: 'Linked List' },
        'middlell': { name: 'Middle of LL', category: 'Linked List' },

        // Binary Trees & BST
        'treetraversals': { name: 'Tree Traversals', category: 'Binary Trees' },
        'treeheight': { name: 'Height of Binary Tree', category: 'Binary Trees' },
        'treediameter': { name: 'Diameter of Binary Tree', category: 'Binary Trees' },
        'balancedtree': { name: 'Balanced Binary Tree', category: 'Binary Trees' },
        'lca': { name: 'Lowest Common Ancestor', category: 'Binary Trees' },
        'zigzag': { name: 'Zigzag Traversal', category: 'Binary Trees' },
        'boundarytraversal': { name: 'Boundary Traversal', category: 'Binary Trees' },
        'verticalorder': { name: 'Vertical Order Traversal', category: 'Binary Trees' },
        'topview': { name: 'Top View of Binary Tree', category: 'Binary Trees' },
        'bottomview': { name: 'Bottom View of Binary Tree', category: 'Binary Trees' },
        'bstsearch': { name: 'Search & Insert in BST', category: 'BST' },
        'bstdelete': { name: 'Delete Node in BST', category: 'BST' },
        'validbst': { name: 'Validate BST', category: 'BST' },
        'kthsmallestbst': { name: 'Kth Smallest in BST', category: 'BST' },
        'bstsucc': { name: 'Inorder Successor in BST', category: 'BST' },

        // Heap
        'heapimpl': { name: 'Heap Implementation', category: 'Heap' },
        'kthlargest': { name: 'Kth Largest Element', category: 'Heap' },
        'mergeksorted': { name: 'Merge K Sorted Lists', category: 'Heap' },
        'mediastream': { name: 'Find Median from Stream', category: 'Heap' },
        'taskscheduler': { name: 'Task Scheduler', category: 'Heap' },

        // Sliding Window & Two Pointers
        'maxsumsubarray': { name: 'Max Sum Subarray', category: 'Sliding Window' },
        'firstnegative': { name: 'First Negative in Window', category: 'Sliding Window' },
        'longestsubstring': { name: 'Longest Substring Without Repeats', category: 'Sliding Window' },
        'maxconsecutiveones': { name: 'Max Consecutive Ones III', category: 'Sliding Window' },
        'minwindowsubstring': { name: 'Minimum Window Substring', category: 'Sliding Window' },
        'twosum': { name: 'Two Sum', category: 'Two Pointers' },
        'containerwater': { name: 'Container With Most Water', category: 'Two Pointers' },
        'removeduplicates': { name: 'Remove Duplicates', category: 'Two Pointers' },
        'movezeroes': { name: 'Move Zeroes', category: 'Two Pointers' },
        'threesum': { name: '3 Sum Problem', category: 'Two Pointers' },

        // Greedy & Backtracking & Bit & Trie & DP
        'nmeetings': { name: 'N Meetings in One Room', category: 'Greedy' },
        'nonoverlapping': { name: 'Non Overlapping Intervals', category: 'Greedy' },
        'fractionalknapsack': { name: 'Fractional Knapsack', category: 'Greedy' },
        'jobsequencing': { name: 'Job Sequencing', category: 'Greedy' },
        'lemonadechange': { name: 'Lemonade Change', category: 'Greedy' },
        'subsetsums': { name: 'Subset Sums', category: 'Backtracking' },
        'combinationsum': { name: 'Combination Sum', category: 'Backtracking' },
        'nqueens': { name: 'N-Queens Problem', category: 'Backtracking' },
        'sudokusolver': { name: 'Sudoku Solver', category: 'Backtracking' },
        'ratinmaze': { name: 'Rat in a Maze', category: 'Backtracking' },
        'singlenumber': { name: 'Single Number', category: 'Bit Manipulation' },
        'countingbits': { name: 'Counting Bits', category: 'Bit Manipulation' },
        'subsetsbitmask': { name: 'Subsets Bitmask', category: 'Bit Manipulation' },
        'minbitflips': { name: 'Minimum Bit Flips', category: 'Bit Manipulation' },
        'poweroftwo': { name: 'Power of Two', category: 'Bit Manipulation' },
        'implementtrie': { name: 'Implement Trie', category: 'Trie' },
        'completestring': { name: 'Complete String', category: 'Trie' },
        'maxxor': { name: 'Maximum XOR', category: 'Trie' },
        'knapsack': { name: '0/1 Knapsack', category: 'DP' },
        'lcs': { name: 'Longest Common Subsequence', category: 'DP' },
        'lis': { name: 'Longest Increasing Subsequence', category: 'DP' },
        'coinchange': { name: 'Coin Change Problem', category: 'DP' },
        'editdistance': { name: 'Edit Distance', category: 'DP' }
    };

    function detectAlgorithmInfo() {
        const path = window.location.pathname.toLowerCase();
        const filename = path.split('/').pop().replace('.html', '');

        if (CATEGORY_MAP[filename]) {
            return CATEGORY_MAP[filename];
        }

        const titleText = document.title || '';
        const h1Text = document.querySelector('h1')?.textContent || '';
        const h2Text = document.querySelector('h2')?.textContent || '';
        const combined = (titleText + ' ' + h1Text + ' ' + h2Text).toLowerCase();

        let detectedCategory = 'Sorting';
        if (combined.includes('search')) detectedCategory = 'Searching';
        else if (combined.includes('graph') || combined.includes('dijkstra') || combined.includes('bfs') || combined.includes('dfs')) detectedCategory = 'Graph';
        else if (combined.includes('knapsack') || combined.includes('dp') || combined.includes('dynamic')) detectedCategory = 'DP';

        const nameMatch = h1Text.replace(/algorithm/i, '').trim() || h2Text.replace(/algorithm/i, '').trim() || filename || 'Algorithm';
        return { name: nameMatch, category: detectedCategory };
    }

    async function initTracker() {
        if (!window.SupabaseApp?.clientReady) return;

        const path = window.location.pathname.toLowerCase();
        const isDetail = path.includes('/algorithm-details/') || document.querySelector('.algorithm-detail-container');

        if (!isDetail) return;

        const { name: algorithmName, category } = detectAlgorithmInfo();
        const sessionRes = await window.SupabaseApp.getCurrentSessionUser();
        const userId = sessionRes?.user?.id;

        // Auto-log page view
        if (userId && algorithmName) {
            await window.SupabaseApp.markAlgorithmViewed(algorithmName, category);
        }

        // Setup "Mark Learned / Completed" buttons
        const completeBtns = document.querySelectorAll('.btn-mark-learned, .btn-mark-complete');
        if (completeBtns.length > 0 && userId) {
            const allProgress = await window.SupabaseApp.loadProgress(userId);
            const isCompleted = (allProgress || []).some(p => p.algorithm_name === algorithmName && p.completed);

            completeBtns.forEach((btn) => {
                if (isCompleted) {
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Completed!';
                    btn.classList.add('completed');
                }

                btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

                    const result = await window.SupabaseApp.markAlgorithmCompleted(algorithmName, category);
                    if (result) {
                        btn.innerHTML = '<i class="fas fa-check-circle"></i> Completed!';
                        btn.classList.add('completed');
                    } else {
                        btn.innerHTML = '<i class="fas fa-check-circle"></i> Mark Learned';
                        btn.disabled = false;
                    }
                });
            });
        }

        // Setup Favorite Buttons
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.querySelector('.btn-favorite') && userId) {
            const favLi = document.createElement('li');
            favLi.innerHTML = `<a href="#" class="btn-favorite"><i class="far fa-star"></i> Favorite</a>`;
            navLinks.appendChild(favLi);
        }

        const favBtns = document.querySelectorAll('.btn-favorite');
        if (favBtns.length > 0 && userId) {
            const allFavs = await window.SupabaseApp.loadFavorites(userId);
            let isFav = (allFavs || []).some(f => f.item_name === algorithmName);

            favBtns.forEach((btn) => {
                if (isFav) {
                    btn.innerHTML = '<i class="fas fa-star" style="color:#ffc107;"></i> Favorited';
                    btn.classList.add('active');
                }

                btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    btn.style.pointerEvents = 'none';

                    const res = await window.SupabaseApp.toggleAlgorithmFavorite(algorithmName, category);
                    if (res) {
                        isFav = res.favorited;
                        if (isFav) {
                            btn.innerHTML = '<i class="fas fa-star" style="color:#ffc107;"></i> Favorited';
                            btn.classList.add('active');
                        } else {
                            btn.innerHTML = '<i class="far fa-star"></i> Favorite';
                            btn.classList.remove('active');
                        }
                    }
                    btn.style.pointerEvents = 'auto';
                });
            });
        }
    }

    window.AlgorithmTracker = {
        initTracker,
        detectAlgorithmInfo,
        TOTAL_PLATFORM_ALGORITHMS
    };

    document.addEventListener('DOMContentLoaded', () => {
        initTracker();
    });
})();
