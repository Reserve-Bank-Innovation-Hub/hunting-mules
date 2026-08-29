// REACT CORE ==========================================================================================================
import { Node } from "reactflow";

// A relationship between two accounts. Money only ever moves along one of these,
// so every transaction the player sees is travelling a line that is drawn.
export interface NetworkEdge {
    id   : string;
    from : string;
    to   : string;
}

export const edgeKey = (a : string, b : string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

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
            const key = edgeKey(node.id, other.id);
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

// Nudge accounts off their grid positions so the board reads as a network rather
// than a spreadsheet, while keeping them far enough apart to stay legible.
export const scatterPosition = (
    x : number,
    y : number,
    spacingX : number,
    spacingY : number,
    bounds : { width : number; height : number; nodeSize : number },
    jitter = 0.26,
) => {
    const offsetX = (Math.random() - 0.5) * 2 * spacingX * jitter;
    const offsetY = (Math.random() - 0.5) * 2 * spacingY * jitter;

    return {
        x : Math.min(Math.max(x + offsetX, 4), bounds.width - bounds.nodeSize - 4),
        y : Math.min(Math.max(y + offsetY, 4), bounds.height - bounds.nodeSize - 4),
    };
};
