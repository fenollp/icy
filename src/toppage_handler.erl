%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(toppage_handler).

%% toppage_handler: serves priv/index.htm

-export([init/3]).
-export([handle/2]).
-export([terminate/3]).

%% API

init(_Transport, Req, []) ->
	{ok, Req, undefined}.

handle(Req, State) ->
	{ok, Body} = file:read_file("priv/index.htm"), %% File IO is not an issue.
	{ok, Req2} = cowboy_req:reply(200,
								  [{<<"content-type">>, <<"text/html">>}],
								  Body, Req),
	{ok, Req2, State}.

terminate(_Reason, _Req, _State) ->
	ok.

%% Internals

%% End of Module
