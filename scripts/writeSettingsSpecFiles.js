const { builders, namedTypes } = require('ast-types');
const camelcase = require('camelcase');
const fs = require('fs');
const b = builders;
const spec = require('../gen/newSettingsSpec');
const lines = [];
const defaultLines = [];
const defaults = {};
const ifaces = Object.keys(spec);

Object.keys(spec).forEach(compName =>  {
    defaults[compName] = {};
    lines.push(`export interface ${compName} {`);
    Object.keys(spec[compName]).forEach(settingName => {
        const d = spec[compName][settingName];
        if(spec[compName][settingName].t === 'boolean') {
            t = 'boolean';
        } else {
            t = 'any';
        }
        if(Object.prototype.hasOwnProperty.call(d, 'def')) {
            defaults[compName][settingName] = d.def;
            defaultLines.push(`${settingName}: ${typeof d.def === 'string' ? `'${d.def}'` : d.def},`);
        }
        lines.push(`    /** ${compName}: ${d.desc} */`);
        lines.push(`    ${settingName}?: ${t};`);//typeof t === 'string' ? `'${t}'` : t};`);
    });
    lines.push(`}\n`);
});
let settingsSource = lines.join('\n') + '\n';
settingsSource += `interface Settings {\n${ifaces.map((i) => (camelcase(i) + '?: ' + i + ';\n')).join('')}\n}\n`;
fs.writeFileSync('Settings.ts', settingsSource, 'utf-8');

process.stdout.write(defaultLines.join('\n') + '\n');

fs.writeFileSync('defaults.json', JSON.stringify(defaults), 'utf-8');
