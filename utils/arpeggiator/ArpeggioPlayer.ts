import MusicalScale from "./MusicalScale";
import ArpeggioPatterns, {type PatternType } from "./ArpeggioPatterns";
import type {
    Key,
} from "./types";

import { Mode } from "./types";

import * as Tone from "tone";

type PlayerParams = {
    container_selector: string;
    aside_selector: string;
    play_toggle_selector: string;
}

export default class ArpeggioPlayer {
    container: HTMLElement | null;
    aside: HTMLElement | null;
    play_toggle: HTMLButtonElement | null;;
    chords: number[];
    ms_key: Key;
    ms_mode: Mode;
    ap_steps: number;
    ap_pattern_type: PatternType;
    ap_pattern_id: number;
    player: {
        chord_step: number;
        octave_base: number;
        arp_repeat: number;
        bass_on: boolean;
        triad_step: number;
        step: number;
        playing: boolean;
        bpm: number;
    };
    chord_count: number;
    channel?: {
        master: Tone.Gain;
        treb: Tone.Gain;
        bass: Tone.Gain;
        kick: Tone.Gain;
        hihat: Tone.Gain;
    };
    fx?: {
        distortion: Tone.Distortion;
        reverb: Tone.Freeverb;
        delay: Tone.PingPongDelay;
    };
    synths?: {
        treb: Tone.PolySynth;
        bass: Tone.DuoSynth;
        kick: Tone.MembraneSynth;
        hihat: Tone.NoiseSynth;
    };
    musicalScale?: MusicalScale;
    arpeggioPatterns?: ArpeggioPatterns;
    arpeggio: number[] = [];
    msUpdateKey?: (newKey: Key) => void;
    msUpdateScale?: () => void;
    msUpdateMode?: (newMode: Mode) => void;
    apUpdateSteps?: (e: Event) => void;
    apUpdatePatternType?: (newArpeggioType: 'straight' | 'looped') => void;
    apUpdatePatternId?: (e: Event) => void;
    apUpdate?: () => void;
    playerUpdateBPM?: (newBeatsPerMinute: number) => void;
    updateData?: (newData: number[]) => void;

    constructor(params: PlayerParams, initialData?: number[]) {
        this.container = document.querySelector(params.container_selector);
        this.aside = document.querySelector(params.aside_selector);
        this.play_toggle = document.querySelector(params.play_toggle_selector) as HTMLButtonElement || null;
        this.chords = initialData ? this.mapDataToChords(initialData) : [1,2,4,0,3,6,0,2];
        this.ms_key = 'B'
        this.ms_mode = Mode.MINOR
        this.ap_steps = 6;
        this.ap_pattern_type = 'straight'; // || 'looped' || 'straight'
        this.ap_pattern_id = 0;
        this.player = {
            chord_step: 0,
            octave_base: 4,
            arp_repeat: 1,
            bass_on: false,
            triad_step: 0,
            step: 0,
            playing: false,
            bpm: 75
        };
        this.chord_count = this.chords.length;
        this.setMusicalScale();
        this.setArpeggioPatterns();
        // this.drawKeyboard();
        // this._drawOutput();
        // this._loadChordSelector();
        // this._loadBPMSelector();
        // this._loadKeySelector();
        // this._loadModeSelector();
        // this._loadStepsSelector();
        // this._loadTypeSelector();
        // this._loadPatternSelector();
        this.loadSynths();
        this.loadTransport();
        
        // Set up data update function
        this.updateData = (newData: number[]) => {
            this.updateDataProgression(newData);
        };
        
        // change tabs, pause player
        document.addEventListener('visibilitychange', () => {
            this.player.playing = true;
            this.playerToggle();
        });
    };

    playerToggle() {
        if (this.player.playing) {
            Tone.getTransport().pause();
            if (!this.channel) return
            this.channel.master.gain.value = 0;
        } else {
            Tone.getTransport().start();
            if (!this.channel) return
            this.channel.master.gain.value = 1;
        }
        this.player.playing = !this.player.playing;
    };

    private loadSynths() {
        this.channel = {
            master: new Tone.Gain(0.7),
            treb: new Tone.Gain(0.7),
            bass: new Tone.Gain(0.8),
            kick: new Tone.Gain(0.9),
            hihat: new Tone.Gain(0.6),
        };
        this.fx = {
            distortion: new Tone.Distortion(0.8),
            reverb: new Tone.Freeverb(0.1, 3000),
            delay: new Tone.PingPongDelay('8n', 0.1),
        };
        this.synths = {
            treb: new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type:  'triangle4',
                },
                envelope: {
                    attack: 0.005,
                    decay: 0.2,
                    sustain: 0.4,
                    release: 2.0
                }
            }),  
            bass: new Tone.DuoSynth(),
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.001,
                    decay: 0.4,
                    sustain: 0.01,
                    release: 1.4,
                    attackCurve: 'exponential'
                }
            }),
            hihat: new Tone.NoiseSynth({
                noise: {
                    type: 'white'
                },
                envelope: {
                    attack: 0.001,
                    decay: 0.05,
                    sustain: 0.0,
                    release: 0.05
                }
            })
        };
        this.synths.bass.vibratoAmount.value = 0.1;
        this.synths.bass.harmonicity.value = 1.5;
        this.synths.bass.voice0.oscillator.type = 'sawtooth'
        this.synths.bass.voice0.envelope.attack = 0.05;
        this.synths.bass.voice1.oscillator.type = 'sawtooth';
        this.synths.bass.voice1.envelope.attack = 0.05;
        // fx mixes
        this.fx.distortion.wet.value = 0.0;
        this.fx.reverb.wet.value = 0.3;
        this.fx.delay.wet.value = 0.1;
        // gain levels
        this.channel.master.toMaster();
        this.channel.treb.connect(this.channel.master);
        this.channel.bass.connect(this.channel.master);
        this.channel.kick.connect(this.channel.master);
        this.channel.hihat.connect(this.channel.master);
        // fx chains
        this.synths.treb.chain(this.fx.delay, this.fx.reverb, this.channel.treb);
        this.synths.bass.chain(this.fx.distortion, this.channel.bass);
        this.synths.kick.connect(this.channel.kick);
        this.synths.hihat.connect(this.channel.hihat);
    };
    
    private loadTransport() {
        this.playerUpdateBPM = (newBeatsPerMinute: number) => {
            this.player.bpm = newBeatsPerMinute;
            Tone.getTransport().bpm.value = this.player.bpm;
        };
        this.playerToggle = () => {
            if (!this.channel) return
            if(this.player.playing) {
                Tone.getTransport().pause();
                this.channel.master.gain.value = 0;
                //   this.play_toggle.classList.remove('active');
            } else {
                Tone.getTransport().start();
                this.channel.master.gain.value = 1;
                //   this.play_toggle.classList.add('active');
            }
            this.player.playing = !this.player.playing;
        };
        // this.play_toggle = document.createElement('button');
        // this.aside.appendChild(this.play_toggle);
        // this.play_toggle?.addEventListener('touchstart', (e) => {
        //     Tone.startMobile();
        // });
        this.play_toggle?.addEventListener('click', (e) => {
            this.playerToggle();
        });
        Tone.getTransport().bpm.value = this.player.bpm;
        Tone.getTransport().scheduleRepeat((time) => {
            let curr_chord = this.player.chord_step % this.chord_count;
            console.log(`Playing chord ${curr_chord} at step ${this.player.step}`);
    
            let chord = this.musicalScale?.notes[this.chords[curr_chord]];
            if (!chord) return;
            // finding the current note
            let notes = chord.triad.notes;
            for(let i = 0; i < Math.ceil(this.ap_steps / 3); i++) {
                notes = notes.concat(notes.map((n) => { return { note: n.note, rel_octave: n.rel_octave + (i + 1)}}));
            }
            let note = notes[this.arpeggio[this.player.step % this.arpeggio.length]];
    
            // setting bass notes
            let bass_o = chord.rel_octave + 2;
            let bass_1 = chord.note + bass_o;
            
            // slappin da bass
            if(!this.player.bass_on) {
                this.player.bass_on = true;
                this.synths?.bass.triggerAttack(bass_1, time);
                // this._utilActiveNoteClassToggle([bass_1.replace('#', 'is')], 'active-b');
            }
            
            // bump the step
            this.player.step++;
            
            // changing chords
            if(this.player.step % (this.arpeggio.length * this.player.arp_repeat) === 0) {
                this.player.chord_step++;
                this.player.bass_on = false;
                this.synths?.bass.triggerRelease(time);
                this.player.triad_step++;
            }
            // arpin'
            let note_ref = `${note.note}${note.rel_octave + this.player.octave_base}`;
            
            // this._utilActiveNoteClassToggle([note_ref.replace('#', 'is')], 'active-t');
            this.synths?.treb.triggerAttackRelease(note_ref, '8n', time);
        }, '8n');
    };
    
    // private drawKeyboard() {
    //     let octaves = [2,3,4,5,6,7];
    //     let keyboard = document.createElement('section');
    //     keyboard.classList.add('keyboard');
    //     this.container.appendChild(keyboard);
    //     octaves.forEach((octave) => {
    //         this.MS.dict.keys.forEach((key) => {
    //         let el = document.createElement('div');
    //         let classname = key.replace('#', 'is') + octave;
    //         el.classList.add(classname);
    //         keyboard.appendChild(el);
    //         });
    //     });
    // };
    
    // private drawOutput() {
    //     this.output = document.createElement('section');
    //     this.output.classList.add('output');
    //     this.aside.appendChild(this.output);
    //     this._updateOutput();
    // };
    
    // private updateOutput() {
    //     this.output.innerHTML = '';
    //     let title = document.createElement('h1');
    //     title.innerHTML = 'Output';
    //     this.output.appendChild(title);
    //     let description = document.createElement('h2');
    //     description.innerHTML = `${this.MS.key} ${this.MS._scale.name}`;
    //     this.output.appendChild(description);
    //     this.chords.forEach((chord) => {
    //         let note = this.MS.notes[chord];
    //         let el = document.createElement('span');
    //         el.innerHTML = `${note.note.replace('#', '<sup>♯</sup>')} <small>${note.triad.type}</small>`;
    //         this.output.appendChild(el);
    //     });
    // };

        // _loadBPMSelector() {
        //   let bpm_container = document.createElement('section');
        //   bpm_container.classList.add('bpm');
        //   this.aside.appendChild(bpm_container);
        //   let title = document.createElement('h1');
        //   title.innerHTML = 'Beats Per Minute';
        //   bpm_container.appendChild(title);
        
        //   [45,60,75,90,105,120,135,150].forEach((bpm) => {
        //     let el = document.createElement('div');
        //     el.setAttribute('data-value', bpm);
        //     if(bpm === this.player.bpm) el.classList.add('bpm-current');
        //     el.innerHTML = bpm;
        //     el.addEventListener('click', (e) => { this.playerUpdateBPM(e); });
        //     bpm_container.appendChild(el);
        //   });
        // };
    
    // private loadChordSelector() {
    //     this.chord_container = document.createElement('section');
    //     this.chord_container.classList.add('chord');
    //     this.container.appendChild(this.chord_container);
    //     let title = document.createElement('h1');
    //     title.innerHTML = 'Chord Progression';
    //     this.chord_container.appendChild(title);
        
        // this.msUpdateChords = (e) => {
        //     let el = e.target;
        //     let chord = el.getAttribute('data-chord');
        //     let value = el.getAttribute('data-value');
        //     this.chords[parseInt(chord)] = value;
        //     this._utilClassToggle(e.target, `chord-${chord}-current`);
        //     this._updateOutput();
        // };
        
    //     for(let c = 0; c < this.chord_count; c++) {
    //         let chord_el = document.createElement('div');
    //         this.MS.notes.forEach((note, i) => {
    //         let el = document.createElement('div');
    //         el.setAttribute('data-value', i);
    //         el.setAttribute('data-chord', c);
    //         if(i === this.chords[c]) el.classList.add(`chord-${c}-current`);
    //         el.innerHTML = 'i ii iii iv v vi vii'.split(' ')[i];
    //         el.addEventListener('click', (e) => { this.msUpdateChords(e); });
    //         chord_el.appendChild(el);
    //         });
    //         this.chord_container.appendChild(chord_el);
    //     }
      
    // //   this._updateChords();
    // };
    
        // private updateChords() {
        //     this.musicalScale?.notes.forEach((note, i) => {
        //         let updates = document.querySelectorAll(`.chord div > div:nth-child(${i + 1})`);
        //         for(let u = 0; u < updates.length; u++) {
        //         updates[u].innerHTML = note.triad.interval;
        //         }
        //     });
        // };
    
    // _loadKeySelector() {
    //   let key_container = document.createElement('section');
    //   key_container.classList.add('keys');
    //   this.container.appendChild(key_container);
    //   let title = document.createElement('h1');
    //   title.innerHTML = 'Tonic / Root';
    //   key_container.appendChild(title);
      
    //   this.MS.dict.keys.forEach((key) => {
    //     let el = document.createElement('div');
    //     el.setAttribute('data-value', key);
    //     if(key === this.ms_key) el.classList.add('key-current');
    //     el.innerHTML = key;
    //     el.addEventListener('click', (e) => { this.msUpdateKey(e); });
    //     key_container.appendChild(el);
    //   });
    // };
    
    // _loadModeSelector() {
    //   let mode_container = document.createElement('section');
    //   mode_container.classList.add('modes');
    //   this.container.appendChild(mode_container);
    //   let title = document.createElement('h1');
    //   title.innerHTML = 'Mode';
    //   mode_container.appendChild(title);
      
    //   this.MS.dict.modes.forEach((mode) => {
    //     let el = document.createElement('div');
    //     el.setAttribute('data-value', mode);
    //     if(mode === this.ms_mode) el.classList.add('mode-current');
    //     el.innerHTML = mode;
    //     el.addEventListener('click', (e) => { this.msUpdateMode(e); });
    //     mode_container.appendChild(el);
    //   });
    // };
    
    // _loadTypeSelector() {
    //   let type_container = document.createElement('section');
    //   type_container.classList.add('type');
    //   this.container.appendChild(type_container);
    //   let title = document.createElement('h1');
    //   title.innerHTML = 'Arpeggio Type';
    //   type_container.appendChild(title);
      
    //   ['straight', 'looped'].forEach((step) => {
    //     let el = document.createElement('div');
    //     el.setAttribute('data-value', step);
    //     if(step === this.ap_pattern_type) el.classList.add('type-current');
    //     el.innerHTML = step;
    //     el.addEventListener('click', (e) => { this.apUpdatePatternType(e); });
    //     type_container.appendChild(el);
    //   });
    // };
    
    // _loadStepsSelector() {
    //   let steps_container = document.createElement('section');
    //   steps_container.classList.add('steps');
    //   this.container.appendChild(steps_container);
    //   let title = document.createElement('h1');
    //   title.innerHTML = 'Arpeggio Steps';
    //   steps_container.appendChild(title);
      
    //   [3,4,5,6].forEach((step) => {
    //     let el = document.createElement('div');
    //     el.setAttribute('data-value', step);
    //     if(step === this.ap_steps) el.classList.add('step-current');
    //     el.innerHTML = step;
    //     el.addEventListener('click', (e) => { this.apUpdateSteps(e); });
    //     steps_container.appendChild(el);
    //   });
    // };
    
    // _loadPatternSelector() {
    //   this.pattern_container = document.createElement('section');
    //   this.pattern_container.classList.add('patterns');
    //   this.container.appendChild(this.pattern_container);
    //   this._updatePatternSelector();
    // };
    
    // _updatePatternSelector() {
    //   this.pattern_container.innerHTML = '';
    //   // reset if the id is over
    //   this.ap_pattern_id = this.ap_pattern_id > this.AP.patterns[this.ap_pattern_type].length - 1 ? 0 : this.ap_pattern_id;
    //   this.arpeggio = this.AP.patterns[this.ap_pattern_type][this.ap_pattern_id];
    //   let title = document.createElement('h1');
    //   title.innerHTML = 'Arpeggio Style';
    //   this.pattern_container.appendChild(title);
    //   let patterns = this.AP.patterns[this.ap_pattern_type];
    //   [720, 120, 24, 6].forEach((count) => { this.pattern_container.classList.remove(`patterns-${count}`); });
    //   this.pattern_container.classList.add(`patterns-${patterns.length}`);
    //   patterns.forEach((pattern, i) => {
    //     let el = document.createElement('div');
    //     el.setAttribute('data-value', i);
    //     if(i === this.ap_pattern_id) el.classList.add('id-current');
    //     el.innerHTML = pattern.join('');
    //     el.appendChild(this._genPatternSvg(pattern));
    //     el.addEventListener('click', (e) => { this.apUpdatePatternId(e); });
    //     this.pattern_container.appendChild(el);
    //   });
    // };
    
    // _genPatternSvg(pattern) {
    //   let hi = Array.from(pattern).sort()[pattern.length - 1];
    //   let spacing = 2;
    //   let svgns = 'http://www.w3.org/2000/svg';
    //   let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    //   let width = pattern.length * spacing + (spacing);
    //   let height = hi + (spacing * 2);
    //   svg.setAttribute('height', height);
    //   svg.setAttribute('width', width);
    //   svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    //   svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    //   let polyline = document.createElementNS(svgns, 'polyline');
    //   let points = [];
    //   let x = spacing;
    //   for(let i = 0; i < pattern.length; i++) {
    //     let y = height - pattern[i] - spacing;
    //     points.push(x + ',' + y);
    //     x += spacing;
    //   }
    //   polyline.setAttribute('points', points.join(' '));
    //   svg.appendChild(polyline);
    //   return svg;
    // };
    
    private setMusicalScale() {
        this.musicalScale = new MusicalScale({ 
            key: this.ms_key,
            mode: this.ms_mode
        });
        this.msUpdateKey = (newKey: Key) => {
            this.ms_key = newKey;
            if (!this.msUpdateScale) return;
            this.msUpdateScale(); 
        };
        this.msUpdateMode = (newMode: Mode) => {
            this.ms_mode = newMode;
            if (!this.msUpdateScale) return;
            this.msUpdateScale();
            // this.updateChords();
        };
        this.msUpdateScale = () => { 
            this.musicalScale?.updateScale({ 
                key: this.ms_key,
                mode: this.ms_mode
            }); 
            // this.updateOutput();
        };
    };
    
    private setArpeggioPatterns() {
        this.arpeggioPatterns = new ArpeggioPatterns({ steps: this.ap_steps });
        this.apUpdateSteps = (e) => { 
            // this._utilClassToggle(e.target, 'step-current');
            // let steps = e.target.getAttribute('data-value'); 
            // this.ap_steps = parseInt(steps); 
            // this.arpeggioPatterns?.updatePatterns({ steps: steps }); 
            // this.apUpdate(); 
            // this._updatePatternSelector();
        };
        this.apUpdatePatternType = (newArpeggioType) => {
            if (!this.arpeggioPatterns) return;
            this.ap_pattern_type = newArpeggioType;
            if (!this.apUpdate) return;
            this.apUpdate()
            // this._utilClassToggle(e.target, 'type-current');
            // this.ap_pattern_type = e.target.getAttribute('data-value'); 
            // this.apUpdate(); 
            // this._updatePatternSelector();
        };
        this.apUpdatePatternId = (e) => { 
            // this._utilClassToggle(e.target, 'id-current');
            // this.ap_pattern_id = parseInt(e.target.getAttribute('data-value'));
            // this.apUpdate(); 
        };
        this.apUpdate = () => { 
            const ap = this.arpeggioPatterns?.patterns[this.ap_pattern_type][this.ap_pattern_id]; 
            if(!ap) return;
            this.arpeggio = ap
        };
        this.arpeggio =  this.arpeggioPatterns?.patterns[this.ap_pattern_type][this.ap_pattern_id]; 
    //   this.apUpdate();
    };

    /**
     * Maps data array to chord positions based on relative height
     * @param data - Array of numbers to be sorted/visualized
     * @returns Array of chord positions (0-6 representing scale degrees)
     */
    private mapDataToChords(data: number[]): number[] {
        if (data.length === 0) return [1,2,4,0,3,6,0,2]; // fallback

        // Create array of indices sorted by data values
        const sortedIndices = Array.from({ length: data.length }, (_, i) => i)
            .sort((a, b) => data[a] - data[b]);
        
        // Create mapping from original indices to height ranks
        const heightRanks: number[] = new Array(data.length);
        sortedIndices.forEach((originalIndex, rank) => {
            heightRanks[originalIndex] = rank;
        });

        // Map height ranks to chord positions (0-6 scale degrees)
        const maxChordIndex = 6; // 7 scale degrees (0-6)
        return heightRanks.map(rank => {
            return Math.floor((rank / (data.length - 1)) * maxChordIndex);
        });
    }

    /**
     * Updates the chord progression with new data
     * @param newData - New array of numbers to visualize
     */
    updateDataProgression(newData: number[]): void {
        this.chords = this.mapDataToChords(newData);
        this.chord_count = this.chords.length;
        // Reset player position to start of new progression
        this.player.chord_step = 0;
        this.player.step = 0;
    }

    /**
     * Maps a single data value to a specific note in the arpeggio based on the current scale
     * @param value - The data value to map
     * @param minValue - Minimum value in the dataset
     * @param maxValue - Maximum value in the dataset
     * @returns Object containing note information { note: string, octave: number }
     */
    mapValueToNote(value: number, minValue: number, maxValue: number): { note: string, octave: number } {
        if (!this.musicalScale || !this.arpeggio || this.arpeggio.length === 0) {
            return { note: 'C', octave: 4 }; // fallback
        }

        // Normalize the value to a 0-1 range
        const normalizedValue = maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue);
        
        // Get the current chord (using first chord for note mapping)
        const chord = this.musicalScale.notes[this.chords[0] || 0];
        if (!chord) return { note: 'C', octave: 4 };

        // Build the full note array (same logic as in loadTransport)
        let notes = chord.triad.notes;
        for(let i = 0; i < Math.ceil(this.ap_steps / 3); i++) {
            notes = notes.concat(notes.map((n) => { 
                return { note: n.note, rel_octave: n.rel_octave + (i + 1)}
            }));
        }

        // Map normalized value to arpeggio position
        const arpeggioIndex = Math.floor(normalizedValue * (this.arpeggio.length - 1));
        const noteIndex = this.arpeggio[arpeggioIndex];
        const selectedNote = notes[noteIndex] || notes[0];

        return {
            note: selectedNote.note,
            octave: selectedNote.rel_octave + this.player.octave_base
        };
    }

    /**
     * Plays a note based on a data value (for sorting step visualization)
     * @param value - The data value
     * @param minValue - Minimum value in dataset
     * @param maxValue - Maximum value in dataset
     * @param duration - Note duration (defaults to '16n')
     */
    playNoteForValue(value: number, minValue: number, maxValue: number, duration: string = '16n'): void {
        if (!this.synths?.treb) return;

        const { note, octave } = this.mapValueToNote(value, minValue, maxValue);
        const noteRef = `${note}${octave}`;
        
        this.synths.treb.triggerAttackRelease(noteRef, duration);
    }

    /**
     * Plays a kick drum sound for sorting comparisons
     * @param duration - Note duration (defaults to '16n')
     */
    playKickDrum(duration: string = '16n'): void {
        if (!this.synths?.kick) return;
        
        this.synths.kick.triggerAttackRelease('C1', duration);
    }

    /**
     * Plays a hi-hat sound for sorting swaps
     * @param duration - Note duration (defaults to '32n')
     */
    playHiHat(duration: string = '32n'): void {
        if (!this.synths?.hihat) return;
        
        this.synths.hihat.triggerAttackRelease(duration);
    }

    /**
     * Gets the current BPM value
     */
    getCurrentBPM(): number {
        return this.player.bpm;
    }

    /**
     * Converts BPM to milliseconds for a quarter note
     * @param bpm - Beats per minute
     * @returns Milliseconds per quarter note
     */
    static bpmToMs(bpm: number): number {
        return (60 / bpm) * 1000;
    }

    /**
     * Converts BPM to milliseconds for different note values
     * @param bpm - Beats per minute  
     * @param noteValue - Note value ('4n', '8n', '16n', etc.)
     * @returns Milliseconds for the note value
     */
    static bpmToMsForNote(bpm: number, noteValue: string = '4n'): number {
        const quarterNoteMs = this.bpmToMs(bpm);
        
        switch (noteValue) {
            case '1n': return quarterNoteMs * 4;
            case '2n': return quarterNoteMs * 2;
            case '4n': return quarterNoteMs;
            case '8n': return quarterNoteMs / 2;
            case '16n': return quarterNoteMs / 4;
            case '32n': return quarterNoteMs / 8;
            default: return quarterNoteMs;
        }
    }
    
    // _utilClassToggle(el, classname) {
    //   let curr = document.querySelectorAll('.' + classname);
    //   for(let i = 0; i < curr.length; i++) curr[i].classList.remove(classname);
    //   el.classList.add(classname);
    // };
    
//     /**  
//     utilActiveNoteClassToggle
//     removes all classnames on existing, then adds to an array of note classes
//     @param note_classes {Array} [A3, B4]
//     @param classname {String} 'active-treble'
//    */
//     _utilActiveNoteClassToggle = (note_classes, classname) => {
//       let removals = document.querySelectorAll(`.${classname}`);
//       for(let r = 0; r < removals.length; r++) removals[r].classList.remove(classname);
//       let adds = document.querySelectorAll(note_classes.map((n) => { return `.${n}`; }).join(', '));
//       for(let a = 0; a < adds.length; a++) adds[a].classList.add(classname);
//     };
}  