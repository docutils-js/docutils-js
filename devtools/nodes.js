#!/usr/bin/env node
const recast = require('recast');
const j = require('jscodeshift');
const fs = require('fs');
const path = require('path');
const PropTypes = require('prop-types');
const nodes = require('../lib/nodes');
const nodesSrc = path.join(__dirname, '../src/nodes.js');
// const nodesJs = fs.createReadStream(nodesSrc);
const source = fs.readFileSync(nodesSrc, { encoding: 'utf-8' });
const file = recast.parse(source);

const superClasses = [];
const leafClasses = [];
let classes = ['Node'];
const r = j(source);
const paths = r.find(j.ClassDeclaration, p => p.superClass).paths();
const nodesInfo = {};
let curNodeInfo;
const flatNodesInfo = {};
/* Each iteration we process the Nth level of the class hierarchy, starting from the root class Node */
while (classes.length) {
    const nextClasses = [];
    classes.forEach((superClass) => {
        curNodeInfo = nodesInfo[superClass];
        const subClasses = paths.filter(p => p.value.superClass.name === superClass).map(p => p.value.id.name);
        const myInfo = {};
        myInfo.leaf = subClasses.length === 0;
        const args = [];
        if (subClasses.length) {
            myInfo.subClasses = subClasses;
            superClasses.push(superClass);
        } else {
            leafClasses.push(superClass);
            const params = nodes[superClass].params;
            if (params) {
                if (Array.isArray(params)) {
                    params.forEach(param => {
                        if (param == nodes.Params.ElementContent) {
                            args.push('Element Content');
                        } else if (param == nodes.Params.RawSource) {
                            args.push('Raw Source');
                        }
                    });
                }
                ;
            }
            //PropTypes.checkPropTypes(nodes[superClass].propTypes, {});
            console.log(superClass);
        }
        try {
            const node = new nodes[superClass](...args);
            myInfo.classTypes = node.classTypes.map(c => c.name);
        } catch(err) {
            myInfo.error = err.message;
        }
//            if(!node.test()) {
//                throw new Error();;
//            }
            myInfo.name = superClass;
            flatNodesInfo[myInfo.name] = myInfo;

        nextClasses.splice(nextClasses.length, 0, ...subClasses);
        console.log(myInfo);
    });
    classes = nextClasses;
}
fs.writeFileSync('nodes.json', JSON.stringify(flatNodesInfo));

console.log(JSON.stringify(flatNodesInfo));
const transBody = j.classBody([]);
const file2 = recast.parse('import BaseWriter from \'../Writer\';\n'
                           + 'import { GenericNodeVisitor } from \'../nodes\';\n');
const classDecl = j.classDeclaration(j.identifier('Translator'), transBody, j.identifier('GenericNodeVisitor'));
file2.program.body.push(classDecl);
const f = file2;
// j.program([j.importDeclaration([j.importNamespaceSpecifier(j.identifier('BaseWriter'))],
//    j.literal('../Writer'), ]));
// console.log(Object.keys(api).filter(x => 1 || x.toLowerCase().indexOf('recast')!== -1));
const methods = [];
leafClasses.forEach((class_) => {
    const params = [j.identifier('node')];

    const m = j.methodDefinition('method', j.identifier(`visit_${class_}`),
                                 j.functionExpression(null, [j.identifier('node')], j.blockStatement([])));
    const eslintHint = j.commentBlock(' eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this ');

    m.comments = [eslintHint];
    const depart = j.methodDefinition('method', j.identifier(`depart_${class_}`),
                                      j.functionExpression(null, [j.identifier('node')], j.blockStatement([])));
    depart.comments = [eslintHint];
    // console.log(m);
    transBody.body.push(m, depart);
    // methods.push(m.toString());
});
fs.createWriteStream('code.js').write(recast.print(f).code);
