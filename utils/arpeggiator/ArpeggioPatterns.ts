import type { ArpeggioParams } from "./types";

export type PatternType = 'straight' | 'looped' | 'hotelcalifornia';

type Patterns = {
    straight: number[][];
    looped: number[][];
    hotelcalifornia: number[][];
};



export default class {
    amount_of_steps: number;
    arr: number[] = [];
    patterns: Patterns = { straight: [], looped: [], hotelcalifornia: [] };
    permutations: number[][] = [];
    looped: number[][] = [];
    steps: number = 0;
    updatePatterns: (params: ArpeggioParams) => void;
    private used: number[] = [];

    constructor(params: ArpeggioParams) {
        this.amount_of_steps = params.steps;
        this.loadPatterns();
        this.updatePatterns = this.pubUpdatePatterns;
    };
    
    pubUpdatePatterns(params: ArpeggioParams) {
        this.steps = params.steps;
        this.loadPatterns();
    };
    
    private loadPatterns() {
        this.arr = [];
        for (let i = 0; i < this.amount_of_steps; i++) {
            this.arr.push(i);
        }
        this.used = [];
        this.permutations = this.permute(this.arr);
        this.looped = this.loop();
        this.patterns = {
            straight: this.permutations,
            looped: this.looped,
            hotelcalifornia: [[0, 3, 2, 3, 1, 3, 2, 3, 0, 3, 1, 3, 2, 3, 1, 3]]
        };
    };
    
    private permute(input: number[], permutations?: number[][]) {
        permutations = permutations || [];
        let current_element: number;

        for (let i = 0; i < input.length; i++) {
            current_element = input.splice(i, 1)[0];
            this.used.push(current_element);
            if (input.length === 0) {
                permutations.push(this.used.slice());
            }
            this.permute(input, permutations);
            input.splice(i, 0, current_element);
            this.used.pop();
        }
        return permutations;
    };
    
    loop() {
        let looped = [];
        for(let p = 0; p < this.permutations.length; p++) {
            let perm = this.permutations[p];
            let arr = Array.from(perm);
            for(let x = 1; x < perm.length - 1; x++) {
            arr.push(perm[perm.length - 1 - x]);
            }
            looped.push(arr);
        }
        return looped;
    };
};