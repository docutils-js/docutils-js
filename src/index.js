/* eslint-disable-next-line import/prefer-default-export */
import parse from './parser';
import { StringOutput } from './io';
import StandaloneReader from './readers/standalone';
import newDocument from './newDocument';
import baseSettings from './baseSettings';
import * as nodes from './nodes';
import Writer from './Writer';
import Transform from './Transform';
import * as defaults from './defaults';
import pojoTranslate from './fn/pojoTranslate';

export const __version__ = '0.14js';

export {
    parse, StringOutput, StandaloneReader, newDocument, baseSettings,
    nodes, Writer, Transform, defaults, pojoTranslate,
};
