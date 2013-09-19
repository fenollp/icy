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
    TRef = erlang:send_after(?PERIOD, self(), refresh),
    {ok, Req, TRef}.

stream(<<"ping: ", Name/binary>>, Req, State) ->
    io:format("ping ~p received\n", [Name]),
    {reply, <<"pong">>, Req, State};

stream(Data, Req, State) ->
    io:format("stream received “~s”\n", [Data]),
    {ok, Req, State}.

info(refresh, Req, _) ->
    TRef = erlang:send_after(?PERIOD, self(), refresh),
    DateTime = cowboy_clock:rfc1123(),
    %io:format("clock refresh timeout: ~s\n", [DateTime]),
    {reply, DateTime, Req, TRef};

info({pass, Thing}, Req, S) ->
    %% Only strings and binaries can go through(!)
    [ToPass] = io_lib:format("~p", [Thing]),
    io:format("Passing: ~p\n", [Thing]),
    {reply, ToPass, Req, S};

info(Info, Req, State) ->
    io:format("info received “~p”\n", [Info]),
    {ok, Req, State}.

terminate(_Req, TRef) ->
    io:format("bullet terminate\n"),
    unregister(icy),
    erlang:cancel_timer(TRef),
    ok.

%% Internals

%% End of Module.
