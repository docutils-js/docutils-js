const lengthUnits = ['em', 'ex', 'px', 'in', 'cm', 'mm', 'pt', 'pc'];

function getMeasure(argument: string, units: string[]) {
    const match = new RegExp(`^([0-9.]+) *(${units.join('|')})$`).exec(argument);
    if(match) {
        const n = parseFloat(match[0]);
        return `n${match[1]}`;
    }
}
function unchanged(argument?: string): any {
    if(argument == null) {
        return '';
    } else {
        return argument;
    }
}

function lengthOrUnitless(argument: string): any {
    return getMeasure(argument, [...lengthUnits, '']);
}

function lengthOrPercentageOrUnitless(argument: string, defaultVal?: string): any {

}

export { unchanged, lengthOrUnitless, lengthOrPercentageOrUnitless };
