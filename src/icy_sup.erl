%% @private
-module(icy_sup).
-behaviour(supervisor).

%% API
-export([start_link/0]).

%% Supervisor
-export([init/1]).

%% API

-spec start_link() -> {ok, pid()}.
start_link() ->
	supervisor:start_link({local, ?MODULE}, ?MODULE, []).

%% Supervisor

init([]) ->
	Procs = [],
	{ok, {{one_for_one, 10, 10}, Procs}}.
