import { publishCmdLine, defaultDescription } from '../src/Core';

const description = `Generates (X)HTML documents from standalone reStructuredText sources.  ${defaultDescription}`;

publishCmdLine({writerName: 'html', description }, (error: Error, output: any): void => {
    if(error) {
        console.log(error.stack);
        console.log(error.message);
    } else {
        console.log(output);
    }
});
