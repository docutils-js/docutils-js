import Text from './Text';

class SpecializedText extends Text {
    _init(args) {
        super._init(args);
    }

    /* istanbul ignore next */
    blank() {
        this.invalidInput();
    }

    /* istanbul ignore next */
    underline() {
        this.invalidInput();
    }

    /* istanbul ignore next */
    indent() {
        this.invalidInput();
    }

    /* istanbul ignore next */
    text() {
    this.invalidInput();
    }

    /* istanbul ignore next */
    eof() {
        return [];
    }

    /* istanbul ignore next */
    invalidInput() {
        console.log('invalid input, throwing eoferror');
        throw new EOFError();
    }
}

SpecializedText.stateName = 'SpecializedText';
SpecializedText.constructor.stateName = 'SpecializedText';
export default SpecializedText;
