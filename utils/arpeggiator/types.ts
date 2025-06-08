export enum Mode {
    MINOR =  'aeo',
    MAJOR =  'ion',
    IONIAN =  'ion',
    DORIAN =  'dor',
    PHRYGIAN =  'phr',
    LYDIAN =  'lyd',
    MIXOLYDIAN =  'mix',
    AEOLIAN =  'aeo',
    LOCRIAN =  'loc',
    MELODIC =  'mel',
    HARMONIC =  'har'
}

export type Scale = {
    name: string
    steps: number[],
    dominance: number[],
    triads: string[]
}

export const Keys = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;
export type Key = typeof Keys[number];

export enum Step {
    WHOLE =  'W',
    HALF =  'H',
    WHOLE_HALF =  'WH'
}

export type ScaleParams = {
    key: Key;
    mode: Mode;
};

export type ArpeggioParams = {
    steps: number;
}

export type ScaleDictionary = {
    keys: Key[];
    scales: { [key: string]: Scale };
    modes: string[];
    triads: { [key: string]: number[] };
}

export type Note = {
    step: number;
    note: Key
    rel_octave: number;
    triad: {
        type: string;
        interval: string;
        notes: {
            note: Key;
            rel_octave: number;
        }[];
    };
}

export type Chord = {
    type: string;
    interval: string;
    notes: {
        note: Key;
        rel_octave: number;
    }[];
}

