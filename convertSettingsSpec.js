const fs = require('fs');
const camelcase = require('camelcase');
const spec = require('./settingsSpec');
const specOut = {};
Object.keys(spec.options).forEach(key => {
    specOut[key] = {};
    spec.options[key].forEach((d) => {
        const { desc, optname, t, def } = d;
        const opt1 = optname;
        const f2 = (t || '').replace(/^validate_/, '');
        const x = {
            desc,
            t: f2
        }
        if (Object.prototype.hasOwnProperty.call(d, 'def')) {
            x['def'] = def;
        }
        specOut[key][camelcase(opt1.substring(2))] = x

    });
});
fs.writeFileSync('newSettingsSpec.json',
    JSON.stringify(specOut), 'utf-8');
