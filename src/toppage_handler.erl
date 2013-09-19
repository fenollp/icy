%% @doc Main page of the clock application.
-module(toppage_handler).

-export([init/3]).
-export([handle/2]).
-export([terminate/3]).

init(_Transport, Req, []) ->
	{ok, Req, undefined}.

handle(Req, State) ->
	{ok, Body} = file:read_file("priv/index.htm"),
	{ok, Req2} = cowboy_req:reply(200,
								  [{<<"content-type">>, <<"text/html">>}],
								  Body, Req),
	{ok, Req2, State}.

terminate(_Reason, _Req, _State) ->
	ok.
