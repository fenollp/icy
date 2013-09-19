all: compile
.PHONY: all

compile: rebar
	./rebar get-deps compile
.PHONY: compile

clean: rebar
	./rebar clean
.PHONY: clean

distclean: clean
	rm -rf ebin deps rebar
.PHONY: distclean

test: compile
	./rebar skip_deps=true eunit
.PHONY: test check

rebar:
	git clone git://github.com/rebar/rebar.git rebar.d
	cd rebar.d && ./bootstrap
	mv rebar.d/rebar $@
	rm -rf ./rebar.d

start: all
	erl -pa ebin -pa deps/*/ebin -s icy -eval "io:format(\"http://localhost:8888\n\")."

debug: rebar
	./rebar skip_deps=true compile -DTEST
	erl -pa ebin -pa deps/*/ebin -pa .eunit
.PHONY: debug
