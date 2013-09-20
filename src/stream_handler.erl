%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(stream_handler).

%% stream_handler: handle the passing of messages.

-export([init/4]).
-export([stream/3]).
-export([info/3]).
-export([terminate/2]).

-define(PERIOD, 1000).

%% API

%% Bullet API

init(_Transport, Req, _Opts, _Active) ->
    io:format("bullet init\n"),
    register(icy, self()),
    {ok, Req, {}}.

stream(<<"ping: ", _Name/binary>>, Req, State) ->
    % io:format("ping ~p received\n", [Name]),
    {reply, <<"pong">>, Req, State};

stream(Data, Req, State) ->
    io:format("stream received “~s”\n", [Data]),
    {ok, Req, State}.

info({pass, Thing}, Req, S) ->
    %% Only strings and binaries can go through(!)
    [ToPass] = io_lib:format("~p", [Thing]),
    io:format("Passing: ~p\n", [Thing]),
    {reply, ToPass, Req, S};

info(Info, Req, State) ->
    io:format("info received “~p”\n", [Info]),
    {ok, Req, State}.

terminate(_Req, _TRef) ->
    io:format("bullet terminate\n"),
    true = unregister(icy),
    ok.

%% Internals

%% End of Module.
