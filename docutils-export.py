import docutils.frontend
import docutils.parsers.rst
import docutils
import docutils.writers.docutils_xml
import docutils.writers.html4css1
import docutils.readers.standalone

modules = ('docutils.frontend',
           'docutils.parsers.rst',
           'docutils',
           'docutils.writers.docutils_xml',
           'docutils.writers.html4css1',
           'docutils.readers.standalone',
           )

import json

    
#out = {}
#for module in modules:
#    mod = import(module)
#    out['frontend'] = 

def proc(desc, opts, d):
    def none():
        pass
    if d == None:
        d = {}
    r = { 'desc': desc, 'optname': opts[0], 't': d.get('validator', none).__name__}
    if 'default' in d:
        r['def'] = d['default']
        
    return r

print(json.dumps({ 'options':
                   {
                       'frontend': [proc(*x) for x in docutils.frontend.OptionParser.settings_spec[2]],
                       'rstParser': [proc(*x) for x in docutils.parsers.rst.Parser.settings_spec[2]],
                       'xmlWriter': [proc(*x) for x in docutils.writers.docutils_xml.Writer.settings_spec[2]],
                                     'standaloneReader': [proc(*x) for x in docutils.readers.standalone.Reader.settings_spec[2]],
                        } }))

