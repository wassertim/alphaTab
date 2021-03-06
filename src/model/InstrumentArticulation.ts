import { TextBaseline } from "@src/platform/ICanvas";
import { Duration } from "./Duration";
import { MusicFontSymbol } from "./MusicFontSymbol";

/**
 * Describes an instrument articulation which is used for percussions. 
 */
export class InstrumentArticulation {
    /**
     * Gets or sets the line the note head should be shown for standard notation
     */
    public staffLine: number;
    /**
     * Gets or sets the note head to display by default. 
     */
    public noteHeadDefault: MusicFontSymbol;
    /**
     * Gets or sets the note head to display for half duration notes. 
     */
    public noteHeadHalf: MusicFontSymbol;
    /**
     * Gets or sets the note head to display for whole duration notes. 
     */
    public noteHeadWhole: MusicFontSymbol;
    /**
     * Gets or sets which additional technique symbol should be placed for the note head. 
     */
    public techniqueSymbol: MusicFontSymbol;
    /**
     * Gets or sets where the technique symbol should be placed. 
     */
    public techniqueSymbolPlacement: TextBaseline;
    /**
     * Gets or sets which midi number to use when playing the note.
     */
    public outputMidiNumber: number;

    public constructor(staffLine: number = 0,
        outputMidiNumber: number = 0,
        noteHeadDefault: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadHalf: MusicFontSymbol = MusicFontSymbol.None,
        noteHeadWhole: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbol: MusicFontSymbol = MusicFontSymbol.None,
        techniqueSymbolPlacement: TextBaseline = TextBaseline.Middle) {
        this.outputMidiNumber = outputMidiNumber;
        this.staffLine = staffLine;
        this.noteHeadDefault = noteHeadDefault;
        this.noteHeadHalf = noteHeadHalf !== MusicFontSymbol.None ? noteHeadHalf : noteHeadDefault;
        this.noteHeadWhole = noteHeadWhole !== MusicFontSymbol.None ? noteHeadWhole : noteHeadDefault;
        this.techniqueSymbol = techniqueSymbol;
        this.techniqueSymbolPlacement = techniqueSymbolPlacement;
    }

    public static copyTo(src: any, dst: InstrumentArticulation) {
        dst.outputMidiNumber = src.outputMidiNumber;
        dst.staffLine = src.staffLine;
        dst.noteHeadDefault = src.noteHeadDefault;
        dst.noteHeadHalf = src.noteHeadHalf;
        dst.noteHeadWhole = src.noteHeadWhole;
        dst.techniqueSymbol = src.techniqueSymbol;
        dst.techniqueSymbolPlacement = src.techniqueSymbolPlacement;
    }

    public getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.Whole:
                return this.noteHeadWhole;
            case Duration.Half:
                return this.noteHeadHalf;
            default:
                return this.noteHeadDefault;
        }
    }
}