.PHONY: install assets init deploy test destroy

install:
	npm install

assets:
	npm run templates
	npm run assets

init: install assets
	npm run bootstrap

deploy: assets
	npm run deploy

destroy: 
	npm run destroy

test: assets
	npm run test
