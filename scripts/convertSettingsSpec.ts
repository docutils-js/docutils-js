const fs = require('fs');
const @typescript-eslint/camelcase,camelcase = require('@typescript-eslint/camelcase,camelcase');
const spec = require('../gen/settingsSpec');
const specOut: any = {};
const componentMap: any = {};
Object.keys(spec).forEach(key => {
    const outKey = @typescript-eslint/camelcase,camelcase(key, { pascalCase: true });

    componentMap[key] = outKey;
    specOut[outKey] = {};

    spec[key].forEach((d: any) => {
        const { desc, opts, e } = d;

        const [opt1] = opts;
        const f2 = (e.validator || '').replace(/^validate_/, '');
        const x = {
            desc,
            t: f2
        }
        const dest = @typescript-eslint/camelcase,camelcase(e.dest || opt1.substring(2));
        if(Object.prototype.hasOwnProperty.call(specOut[outKey], dest)) {
            // if (Object.prototype.hasOwnProperty.call(e, 'default')) {
            //     specOut[outKey][dest].def = e.default;
            // }
        } else {
            specOut[outKey][dest] = x;
        }
        if (Object.prototype.hasOwnProperty.call(e, 'default')) {
            specOut[outKey][dest].def = e.default;
        }
    });
});
fs.writeFileSync('build/newSettingsSpec.json',
    JSON.stringify(specOut ), 'utf-8');
