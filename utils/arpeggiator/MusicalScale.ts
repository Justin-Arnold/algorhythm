import type { ScaleDictionary, Key, ScaleParams, Chord, Note } from './types';
import { Mode, Step, Keys } from './types';

export default class MusicalScale {
    dict: ScaleDictionary
    updateScale: (params: ScaleParams) => void;
    key: Key = 'C';
    mode: Mode =  Mode.MINOR;
    notes: Note[] = [];
    scale;

    constructor(params: ScaleParams) {
        this.dict = this.loadDictionary();
        this.scale = this.dict.scales[this.mode];

        this.updateScale = this.pubUpdateScale
        this.loadScale(params);
    };

    private loadScale(params: ScaleParams): void {
        this.key = params.key;
        this.mode = params.mode;
        this.notes = [];
        this.scale = this.dict.scales[this.mode];
        // notes to cycle through
        let keys = this.dict.keys;
        // starting index for key loop
        let offset = keys.indexOf(this.key);
        for (let s = 0; s < this.scale.steps.length - 1; s++) {
            let step = this.scale.steps[s];
            let idx = (offset + step) % keys.length;
            // relative octave. 0 = same as root, 1 = next ocave up
            let rel_octave = (offset + step) > keys.length - 1 ? 1 : 0;
            // generate the relative triads
            let triad = this.genTriad(s, idx, rel_octave, this.scale.triads[s]);
            // define the note
            let note: Note = { step: s, note: keys[idx], rel_octave: rel_octave, triad: triad };
            // add the note
            this.notes.push(note);
        }
    };

    pubUpdateScale(params: ScaleParams) {
        console.log('Updating scale with params:', params);
        this.loadScale(params);
    };

    // create a chord of notes based on chord type
    genTriad(current_step: number, offset: number, octave: number, triad_type: string) {
        // get the steps for this chord type
        let steps = this.dict.triads[triad_type];

        // instantiate the chord
        let chord: Chord = { type: triad_type, interval: this.intervalFromType(current_step, triad_type), notes: [] };
        // load the notes
        let keys = this.dict.keys;
        for (let i = 0; i < steps.length; i++) {
            let step = steps[i];
            let idx = (offset + step) % keys.length;
            // relative octave to base
            let rel_octave = (offset + step) > keys.length - 1 ? octave + 1 : octave;
            // define the note
            chord.notes.push({ 
                note: keys[idx],
                rel_octave: rel_octave 
            });
        }
        return chord;
    };

    // proper interval notation from the step and type
    intervalFromType(step: number, type: string) {
        let steps = 'i ii iii iv v vi vii'.split(' ');
        let s = steps[step];
        switch (type) {
            case 'maj':
                s = s.toUpperCase(); break;
            case 'min':
                s = s; break;
            case 'aug':
                s = s.toUpperCase() + '+'; break;
            case 'dim':
                s = s + '°'; break;
        }
        return s;
    };

    loadDictionary(): ScaleDictionary {
        return {
            keys: Array.from(Keys),
            scales: {
                ion: {
                    name: 'Ionian',
                    steps: this.genSteps([Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.WHOLE, Step.HALF]),
                    dominance: [3, 0, 1, 0, 2, 0, 1],
                    triads: this.genTriads(0)
                },
                dor: {
                    name: 'Dorian',
                    steps: this.genSteps([Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE]),
                    dominance: [3, 0, 1, 0, 2, 2, 1],
                    triads: this.genTriads(1)
                },
                phr: {
                    name: 'Phrygian',
                    steps: this.genSteps([Step.HALF, Step.WHOLE, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE]), 
                    dominance: [3, 2, 1, 0, 2, 0, 1],
                    triads: this.genTriads(2)
                },
                lyd: {
                    name: 'Lydian',
                    steps: this.genSteps([Step.WHOLE, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.HALF]),
                    dominance: [3, 0, 1, 2, 2, 0, 1],
                    triads: this.genTriads(3)
                },
                mix: {
                    name: 'Mixolydian',
                    steps: this.genSteps([Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE]),
                    dominance: [3, 0, 1, 0, 2, 0, 2],
                    triads: this.genTriads(4)
                },
                aeo: {
                    name: 'Aeolian',
                    steps: this.genSteps([Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE]),
                    dominance: [3, 0, 1, 0, 2, 0, 1],
                    triads: this.genTriads(5)
                },
                loc: {
                    name: 'Locrian',
                    steps: this.genSteps([Step.HALF, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.WHOLE]),
                    dominance: [3, 0, 1, 0, 3, 0, 0],
                    triads: this.genTriads(6)
                },
                mel: {
                    name: 'Melodic Minor',
                    steps: this.genSteps([Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.WHOLE, Step.WHOLE, Step.HALF]),
                    dominance: [3, 0, 1, 0, 3, 0, 0],
                    triads: 'min min aug maj maj dim dim'.split(' ')
                },
                har: {
                    name: 'Harmonic Minor',
                    steps: this.genSteps([Step.WHOLE, Step.HALF, Step.WHOLE, Step.WHOLE, Step.HALF, Step.WHOLE_HALF, Step.WHOLE]),
                    dominance: [3, 0, 1, 0, 3, 0, 0],
                    triads: 'min dim aug min maj maj dim'.split(' ')
                }
            },
            modes: [
                'ionian', 'dorian', 'phrygian',
                'lydian', 'mixolydian', 'aeolian',
                'locrian', 'major', 'minor',
                'melodic', 'harmonic'
            ],
            triads: {
                maj: [0, 4, 7],
                min: [0, 3, 7],
                dim: [0, 3, 6],
                aug: [0, 4, 8]
            }
        };
    };

    genTriads(offset: number) {
        let base = 'maj min min maj maj min dim'.split(' ');
        let triads = [];
        for (let i = 0; i < base.length; i++) {
            triads.push(base[(i + offset) % base.length]);
        }
        return triads;
    };

    genSteps(steps: Step[]): number[] {
        let stepIntervals = [0];
        let currentInterval = 0;
        steps.forEach((step) => {
            switch (step) {
                case Step.WHOLE:
                    currentInterval += 2; 
                    break;
                case Step.HALF:
                    currentInterval += 1;
                    break;
                case Step.WHOLE_HALF:
                    currentInterval += 3;
                    break;
            }
            stepIntervals.push(currentInterval);
        })
        return stepIntervals;
    };
};
