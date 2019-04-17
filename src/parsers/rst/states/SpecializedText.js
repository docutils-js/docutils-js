import Text from './Text';

class SpecializedText extends Text {
    _init(args) {
        super._init(args);
    }

    blank() {
        this.invalidInput();
    }

    underline() {
        this.invalidInput();
    }

    indent() {
        this.invalidInput();
    }

    text() {
    this.invalidInput();
    }

    eof() {
        return [];
    }

    invalidInput() {
        console.log('invalid input, throwing eoferror');
        throw new EOFError();
    }
}

SpecializedText.stateName = 'SpecializedText';
SpecializedText.constructor.stateName = 'SpecializedText';
export default SpecializedText;
