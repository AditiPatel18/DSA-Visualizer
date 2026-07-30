#include <iostream>
#include <vector>
#include <queue>
#include <climits>
#include <algorithm>
using namespace std;

class Dijkstra {
private:
    struct Edge {
        int dest;
        int weight;
        Edge(int d, int w) : dest(d), weight(w) {}
    };
    
    struct Node {
        int vertex;
        int distance;
        Node(int v, int d) : vertex(v), distance(d) {}
        
        // For priority queue (min-heap)
        bool operator>(const Node& other) const {
            return distance > other.distance;
        }
    };
    
public:
    // Find shortest path from source to all vertices
    vector<int> shortestPath(vector<vector<Edge>>& graph, int source) {
        int n = graph.size();
        vector<int> dist(n, INT_MAX);
        vector<bool> visited(n, false);
        vector<int> parent(n, -1);
        
        // Min-heap priority queue
        priority_queue<Node, vector<Node>, greater<Node>> pq;
        
        dist[source] = 0;
        pq.push(Node(source, 0));
        
        while (!pq.empty()) {
            Node current = pq.top();
            pq.pop();
            
            int u = current.vertex;
            
            if (visited[u]) continue;
            visited[u] = true;
            
            for (const Edge& edge : graph[u]) {
                int v = edge.dest;
                int weight = edge.weight;
                
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u;
                    pq.push(Node(v, dist[v]));
                }
            }
        }
        
        return dist;
    }
    
    // Print shortest distances
    void printDistances(const vector<int>& dist, int source) {
        cout << "Vertex \t Distance from Source " << source << endl;
        for (int i = 0; i < dist.size(); i++) {
            if (dist[i] == INT_MAX)
                cout << i << " \t\t INF" << endl;
            else
                cout << i << " \t\t " << dist[i] << endl;
        }
    }
    
    // Print path from source to destination
    void printPath(const vector<int>& parent, int destination) {
        if (parent[destination] == -1) {
            cout << destination;
            return;
        }
        printPath(parent, parent[destination]);
        cout << " -> " << destination;
    }
};

int main() {
    Dijkstra dijkstra;
    
    // Create graph with 6 vertices
    int vertices = 6;
    vector<vector<Dijkstra::Edge>> graph(vertices);
    
    // Add edges (directed graph)
    graph[0].push_back(Dijkstra::Edge(1, 4));
    graph[0].push_back(Dijkstra::Edge(2, 2));
    graph[1].push_back(Dijkstra::Edge(3, 5));
    graph[2].push_back(Dijkstra::Edge(1, 1));
    graph[2].push_back(Dijkstra::Edge(3, 8));
    graph[2].push_back(Dijkstra::Edge(4, 10));
    graph[3].push_back(Dijkstra::Edge(4, 2));
    graph[3].push_back(Dijkstra::Edge(5, 6));
    graph[4].push_back(Dijkstra::Edge(5, 3));
    
    int source = 0;
    vector<int> distances = dijkstra.shortestPath(graph, source);
    
    cout << "=== Dijkstra's Algorithm ===" << endl;
    cout << "Graph with " << vertices << " vertices" << endl;
    cout << "Source vertex: " << source << endl << endl;
    
    dijkstra.printDistances(distances, source);
    
    // Example: Path to vertex 5
    cout << endl << "Path to vertex 5: ";
    // Note: Need to run shortestPath again with parent tracking for full path
    // This is simplified version
    
    return 0;
}