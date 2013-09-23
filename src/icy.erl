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
        _ -> ?MODULE ! {pass, js_encode(Thing)}   %% Only strings and binaries can go through(!)
    end.

%% Internals

%% file:consult/1 JS equivalent.
js_encode (E) ->
    io:format("Passing: ~p\n", [E]),
    "{\"Erlang\": "++ json(E) ++"}".

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
