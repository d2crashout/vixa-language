// deno-lint-ignore-file
import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = [];

    private not_eof (): boolean {
        return this.at().type != TokenType.EOF;
    }

    private at () {
        return this.tokens[0] as Token;
    }

    private eat () {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect (type: TokenType, err: any) {
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, "Expecting: ", type);
            Deno.exit(1);
        }

        return prev;
    }

    public produceAST (sourceCode: string): Program {
        this.tokens = tokenize(sourceCode);
        const program: Program = {
            kind: "Program",
            body: [],
        };

        // Parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }
        
        return program;
    }

    private parse_stmt (): Stmt {
        // skip to parse_expr
        return this.parse_expr();
    }

    private parse_expr (): Expr {
        return this.parse_additive_expr();
    }

    private parse_additive_expr (): Expr {
        let left = this.parse_multiplicative_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }


        return left;
    }

    private parse_multiplicative_expr (): Expr {
        let left = this.parse_primary_expr();

        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }


        return left;
    }


    // Orders of Precidence
    // AdditiveExpr
    // MultiplicativeExpr
    // PrimaryExpr

    private parse_primary_expr (): Expr {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier;
            case TokenType.Number:
                return { 
                    kind: "NumericLiteral", 
                    value: parseFloat(this.eat().value),
                 } as NumericLiteral;
            case TokenType.OpenParen: {
                this.eat(); // Eat the open paren
                const value = this.parse_expr();
                this.expect(
                    TokenType.CloseParen, 
                    "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
                ); // Eat the closing paren
                return value;
            }
            case TokenType.CloseParen:
            case TokenType.Equals:
            case TokenType.BinaryOperator:
            case TokenType.Let:
            case TokenType.EOF:
            default:
                console.error("Unexpected token found during parsing!", this.at());
                Deno.exit(1);
        }
    }
}