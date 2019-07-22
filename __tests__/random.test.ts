import {
  Type,
  builtInTypes,
  builders as b,
  finalize,
} from "ast-types";

const { def } = Type;
const { string } = builtInTypes;

def("Test").bases("Node").build("one").field("one", string);
finalize();
test('1', () => {

console.log(b.test('foo'));
});
