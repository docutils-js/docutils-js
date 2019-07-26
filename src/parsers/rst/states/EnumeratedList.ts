import SpecializedBody from './SpecializedBody';
import {RegexpResult, ContextArray, StateType, StateInterface,ParseMethodReturnType} from '../../../types';
import{EOFError}from'../../../Exceptions';

/** Second and subsequent enumerated_list list_items. */
class EnumeratedList extends SpecializedBody {
    private lastordinal: number = 0;
    private auto?: number;
    private format?: string;
    /** Enumerated list item. */
    public enumerator(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        const [format, sequence, text, ordinal] = this.parse_enumerator(
            match, this.parent!.attributes.enumtype,
        );
        if ((format !== this.format
              || (sequence !== '#' && (sequence !== this.parent!.attributes.enumtype
                                       || this.auto// fixme
                                       || ordinal !== (this.lastordinal + 1)))
              || !this.is_enumerated_list_item(ordinal, sequence, format))) {
            // # different enumeration: new list
            // @ts-ignore
            this.invalid_input();
        }
        if (sequence === '#') {
            this.auto = 1;
        }
        const [listitem, blankFinish] = this.list_item(
            match.result.index + match.result[0].length,
        );
        this.parent!.add(listitem);
        this.blankFinish = blankFinish;
        this.lastordinal = ordinal;
        return [[], nextState, []];
    }

    /*
        Check validity based on the ordinal value and the second line.

        Return true if the ordinal is valid and the second line is blank,
        indented, or starts with the next enumerator or an auto-enumerator.
*/
    // eslint-disable-next-line @typescript-eslint/camelcase
    private is_enumerated_list_item(ordinal: number|undefined, sequence: string, format: string): boolean {
        if (ordinal === undefined) {
            return false;
        }
        let nextLine: string|undefined;
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            nextLine = this.stateMachine!.nextLine();
        } catch(error) {
            if(error instanceof EOFError) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.stateMachine!.previousLine();
                return true;
            }
	    }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.stateMachine!.previousLine();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if(!nextLine!.substring(0, 1).trim()) {
            return true;
        }
        const result = this.make_enumerator(ordinal + 1, sequence, format);
        if(result) {
            const [ nextEnumerator, autoEnumerator] = result;
            if(nextLine!.startsWith(nextEnumerator)
  || nextLine!.startsWith(autoEnumerator)) {
                return true;
            }
            return false;
        }
	    return false;
    }
  
    /**
        Analyze an enumerator and return the results.

        :Return:
            - the enumerator format ('period', 'parens', or 'rparen'),
            - the sequence used ('arabic', 'loweralpha', 'upperroman', etc.),
            - the text of the enumerator, stripped of formatting, and
            - the ordinal value of the enumerator ('a' -> 1, 'ii' -> 2, etc.;
              ``None`` is returned for invalid enumerator text).

        The enumerator format has already been determined by the regular
        expression match. If `expected_sequence` is given, that sequence is
        tried first. If not, we check for Roman numeral 1. This way,
        single-character Roman numerals (which are also alphabetical) can be
        matched. If no sequence has been matched, all sequences are checked in
        order.
*/
    private parse_enumerator(match: RegexpResult, enumtype: string): any[] {

        // fixme implement
        return [];
    }
}
EnumeratedList.stateName = 'EnumeratedList';
//EnumeratedList.constructor.stateName = 'EnumeratedList';
export default EnumeratedList;
