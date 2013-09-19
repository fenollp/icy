%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(icy).

%% icy: 

-export([start/0]).

%% API

start() ->
    [ok,ok,ok,ok] = [application:start(App) || App <- [crypto,ranch,cowboy,icy]].

%% Internals

%% End of Module.
