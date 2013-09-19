%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(icy_sup).
-behaviour(supervisor).

%% icy_sup: supervisor for icy.

-export([start_link/0]).

-export([init/1]).

%% API

-spec start_link() -> {ok, pid()}.
start_link() ->
	supervisor:start_link({local, ?MODULE}, ?MODULE, []).

%% Supervisor API

init([]) ->
	Procs = [],
	{ok, {{one_for_one, 10, 10}, Procs}}.

%% Internals

%% End of Module
