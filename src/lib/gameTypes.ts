import { Node } from "reactflow";

export interface NodeData {
    isMule? : boolean;
    isLocked? : boolean;
    isShaking? : boolean;
    onNodeClick? : (nodeId : string, isMule : boolean) => void;
}

export interface TransactionInstance {
    id : string;
    fromNode : Node;
    toNode : Node;
    amount : string;
    isSecondaryMuleTransaction? : boolean;
    originalAmount? : number;
}

export interface NodeRipple {
    id : string;
    nodeId : string;
    x : number;
    y : number;
    isLocked? : boolean;
}

export interface GridDimensions {
    rows : number;
    columns : number;
    spacingX : number;
    spacingY : number;
    startX : number;
    startY : number;
}