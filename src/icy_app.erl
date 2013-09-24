%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(icy_app).
-behaviour(application).

%% icy_app: application module of icy.

-export([start/2]).
-export([stop/1]).

%% API

start(_Type, _Args) ->
	Dispatch = cowboy_router:compile([
		{'_', [
			{"/", toppage_handler, []},
			{"/bullet", bullet_handler, [{handler, stream_handler}]},
			{"/static/[...]", cowboy_static, [
				{directory, {priv_dir, bullet, []}},
				{mimetypes, [
					{<<".js">>, [<<"application/javascript">>]}
				]}
			]},
			{"/rsc/[...]", cowboy_static, [
				{directory, {priv_dir, icy, [<<"resources">>]}},
				{mimetypes, [
					{<<".js">>, [<<"application/javascript">>]},
					{<<".css">>, [<<"text/css">>]},
					{<<".json">>, [<<"application/json">>]}
				]}
			]}
		]}
	]),
	{ok, _} = cowboy:start_http(http, 100,
		[{port, 8888}], [{env, [{dispatch, Dispatch}]}]
	),
	icy_sup:start_link().

stop(_State) ->
	ok.

%% Internals

%% End of Module
