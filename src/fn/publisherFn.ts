import read from './reader';
import {Settings} from "../../gen/Settings";
// import parse from '../parser';

/* Recast of Publisher class to function */
/* where should reader come from? we only have one after all */
/* eslint-disable-next-line no-unused-vars */
function publish(source: string, settings: Settings) {
    const document = read(source, settings);
    return document;
}

export default publish;
