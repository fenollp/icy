%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(icy).

%% icy: wrapper-module.

-export([start/0]).

-export([pass/1]).

%% API

start() ->
    [ok,ok,ok,ok] = [application:start(App) || App <- [crypto,ranch,cowboy,?MODULE]].


pass (Thing) ->
    case whereis(?MODULE) of
        undefined -> {error,{unable_to_pass,server_down}};
        _ -> ?MODULE ! {pass, Thing}
    end.

%% Internals

%% End of Module.
