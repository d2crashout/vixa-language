export type NodeType = 
    | "Program" 
    | "NumericLiteral" 
    | "Identifier" 
    | "BinaryExpr"; 
    /*| "CallExpr" 
    | "UnaryExpr" 
    | "FunctionDeclaration"*/

export interface Stmt {
    kind: NodeType;
}

export interface Program extends Stmt {
    kind: "Program",
    body: Stmt[];
}