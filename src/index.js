/* eslint-disable-next-line import/prefer-default-export */
import parse from './parser';
import { StringOutput } from './io';
import StandaloneReader from './readers/standalone';
import newDocument from './newDocument';
import baseSettings from './baseSettings';
import * as nodes from './nodes';

export const __version__ = '0.14js';

export {
 parse, StringOutput, StandaloneReader, newDocument, baseSettings, nodes,
};
