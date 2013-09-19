%% @private
-module(icy_app).
-behaviour(application).

%% API
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
			]}
		]}
	]),
	{ok, _} = cowboy:start_http(http, 100,
		[{port, 8888}], [{env, [{dispatch, Dispatch}]}]
	),
	icy_sup:start_link().

stop(_State) ->
	ok.
