MODULES := example-chat-X utils-X
.PHONY: $(MODULES)

.PHONY: clean
clean:
	rm -rf lib
	rm -rf node_modules

./lib:
	mkdir lib

./node_modules:
	npm install

.PHONY: setup
setup: ./lib ./node_modules

.PHONY: upgrade-dependencies
upgrade-dependencies: ./node_modules
	npm upgrade

.PHONY: unit-test
unit-test: ./node_modules
	npm test

.PHONY: $(MODULES:-X=-unit-test)
$(MODULES:-X=-unit-test): ./node_modules
	npx mocha --exit --require babel-register --recursive ./test/$(subst -unit-test,,$@)/**/*spec.js
