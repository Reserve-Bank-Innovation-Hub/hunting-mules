// REACT CORE ==========================================================================================================
import { Node } from "reactflow";

// A relationship between two accounts. Money only ever moves along one of these,
// so every transaction the player sees is travelling a line that is drawn.
export interface NetworkEdge {
    id   : string;
    from : string;
    to   : string;
}

export interface Network {
    edges     : NetworkEdge[];
    adjacency : Map<string, string[]>;
}

/**
 * Join each account to its nearest neighbours. The result is a loose mesh rather
 * than a lattice — enough structure to read as a network, not so much that it
 * turns into a diagram.
 */
export const buildNetwork = (nodes : Node[], neighboursPerNode = 5) : Network => {
    const edgeMap = new Map<string, NetworkEdge>();
    const adjacency = new Map<string, string[]>();

    nodes.forEach(node => adjacency.set(node.id, []));

    nodes.forEach(node => {
        const nearest = nodes
            .filter(other => other.id !== node.id)
            .map(other => ({
                other,
                distance : Math.hypot(
                    other.position.x - node.position.x,
                    other.position.y - node.position.y,
                ),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, neighboursPerNode);

        nearest.forEach(({other}) => {
            const key = node.id < other.id ? `${node.id}|${other.id}` : `${other.id}|${node.id}`;
            if (!edgeMap.has(key)) {
                edgeMap.set(key, {id : key, from : node.id, to : other.id});
            }
        });
    });

    // Adjacency is derived from the deduped edges, so it always agrees with what is drawn
    edgeMap.forEach(edge => {
        adjacency.get(edge.from)?.push(edge.to);
        adjacency.get(edge.to)?.push(edge.from);
    });

    return {edges : Array.from(edgeMap.values()), adjacency};
};

// Accounts sit on the lattice exactly, in clean rows and columns. This only keeps
// them inside the board, in case rounding at an awkward viewport pushes the last
// row or column a pixel over the edge.
export const clampToBoard = (
    x : number,
    y : number,
    bounds : { width : number; height : number; nodeSize : number },
) => ({
    x : Math.min(Math.max(x, 4), bounds.width - bounds.nodeSize - 4),
    y : Math.min(Math.max(y, 4), bounds.height - bounds.nodeSize - 4),
});
