const fs = require('fs');
const camelcase = require('camelcase');
const spec = require('../gen/settingsSpec');
const specOut = {};
Object.keys(spec).forEach(key => {
    const outKey = camelcase(key, { pascalCase: true });

    specOut[outKey] = {};

    spec[key].forEach((d) => {
        const { desc, opts, e } = d;

        const [opt1] = opts;
        const f2 = (e.validator || '').replace(/^validate_/, '');
        const x = {
            desc,
            t: f2
        }
        const dest = camelcase(e.dest || opt1.substring(2));
        if(Object.prototype.hasOwnProperty.call(specOut[outKey], dest)) {
            throw new Error(`key already exists ${dest}`);
        }
        if (Object.prototype.hasOwnProperty.call(e, 'default')) {
            x.def = e.default;
        }
        specOut[outKey][dest] = x;

    });
});
fs.writeFileSync('build/newSettingsSpec.json',
    JSON.stringify(specOut), 'utf-8');
