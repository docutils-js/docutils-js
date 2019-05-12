YARN=yarn
GRUNT=$(YARN) grunt
JSDOC=$(GRUNT) jsdoc
BABEL=$(GRUNT) babel

default: babel

babel:
	$(BABEL)

doc: jsdoc

jsdoc:
	$(JSDOC)

watch-doc:
	$(GRUNT) watch:doc
