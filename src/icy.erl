%% See LICENSE for licensing information.
%% -*- coding: utf-8 -*-
-module(icy).

%% icy: wrapper-module.

-export([start/0]).

-export([pass/4]).
-export([time/0]).

-export([test_pass/0]). %% Used when testing the bridge.

-define(G, 1000000000).
-define(M,    1000000).

%% API

start() ->
    [ok,ok,ok,ok] = [application:start(App) || App <- [crypto,ranch,cowboy,?MODULE]].


-type name() :: string() | atom().
-spec pass (Name::name(), Time::pos_integer(), Description::name(), Thing::term()) -> any().
%% Time has to be the result of ?MODULE:time/0, executed on the distant module
%%   in order to preserve synchronicity.

pass (Name, Time, Description, Thing) ->
    case whereis(?MODULE) of
        undefined -> {error,{unable_to_pass,server_down}};
        _ -> ?MODULE ! {pass, js_encode({Name, Time, Description, Thing})}, ok
    end.


-spec time () -> N::pos_integer().
time () ->
    {A, B, C} = os:timestamp(),
    ?G * A + ?M * B + C.


test_pass () ->
    icy:pass(test, icy:time(), "this is bla", {bla,bla,icy:time()}).

%% Internals

%% Only strings and binaries can go through(!)
%% file:consult/1 JS equivalent.
js_encode (E) ->
    io:format("Passing: ~p\n", [E]),
    This = "{\"Erlang\": "++ json(E) ++"}",
    [That] = io_lib:format("~p", [This]),
    That.

json (T) when is_tuple(T) ->
    "{ \"Tuple\": "++ json(tuple_to_list(T)) ++" }";
json (L) when is_list(L) ->
    case is_string(L) of
        true -> "\""++ L ++"\"";
        false -> "[ "++ string:join([json(E) || E <- L],", ") ++" ]"
    end;
json (A) when is_atom(A) -> %% Boo!
    [$"]++ atom_to_list(A) ++[$"];
json (Term) ->
    [Str] = io_lib:format("~p", [Term]),
    case Term of
        T when is_pid(T); is_function(T) ->
            [$"]++ Str ++[$"]
        ; _ -> Str
    end.


is_string (L) ->
    lists:foldl(
        fun erlang:'and'/2,
        true,
        [case C of
            C when C >= 32, C =< 126 -> true;
            _ -> false
        end|| C <- L]).

%% End of Module.
