/* Icy lib */

function EON (e_string) { // Erlang Object Notation :d
    var obj = $.parseJSON(eval(e_string));
    console.log('RECV: ' + JSON.stringify(obj));
    return {name: obj["Erlang"]["Tuple"].shift(),
            time: obj["Erlang"]["Tuple"].shift(),
            desc: obj["Erlang"]["Tuple"].shift(),
            data: obj["Erlang"]["Tuple"][0]};
};

function EONS_append (neweon, tag) {
    function new_line (obj){
        function pre (str){ return str.replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        return  '<tr>' +
                    '<td class="  left-text"><pre>'+ obj.name +' “'+obj.desc+'”' +'</pre></td>'+
                    '<td class="center-text"><pre>'+ ' ⟼ '                      +'</pre></td>'+
                    '<td class=" right-text"><pre>'+ pre(EON_str(obj.data))      +'</pre></td>'+
                    '<td class="id-text">'+          obj.time                          +'</td>'+
                '</tr>';
    }
    var item = $(new_line(neweon));
    item.hide().appendTo(tag).show('normal');
    $("html, body").animate({scrollTop: item.offset().top -($(window).height() -item.outerHeight())}, 0);
};

function EON_str (obj){
    var text = JSON.stringify(obj);
    // Handle Erlang tuples
    text = text.replace(/{"Tuple":\[/g, '{');
    text = text.replace(/\]}/g, '}');
    text = text.replace(/{"Tuple":""}/g, '{}');
    // Heuristics
    text = text.replace(/""/g, '[]');
    text = text.replace(/"</g, '<');
    text = text.replace(/"#/g, '#');
    text = text.replace(/>"/g, '>');
    // Note: ordering of .replace/2 matters!
    return text;
};



function TREE_build (eons){
    if ($.isEmptyObject(eons)) return;

    function i(str){ return '“'+ str +'”'; }

    var NODES = [], EDGES = []; // The tree
    var FORKS = {}, UNUSED = []; /// MAY display UNUSED (id='time':) differently?
    var P_NODE;

    var kvs = TREE_get_keyvalues(eons);
    kvs.forEach(function(kv){
    try{
        // Fullcaps are for variables declared before this loop.
        // Careful with forks. Create|close them in a single case: or otherwise…
        // Order here doesn't really matter (does it?)
        // Certain assumptions may have been made. Eg: it is going to end fast enough for Pids
        //   to be garanteed unique identifiers.
        switch (true){
            case /^tea : 'i'/.test(kv['key']):
                P_NODE = TREE_add_leaf_simple(NODES,EDGES,
                    i(kv['value']['Tuple'][1]), "node-INPUT", null, P_NODE);
                break;

            case /^tea : 'result'/.test(kv['key']) && P_NODE !== undefined:
                P_NODE = TREE_add_leaf_simple(NODES,EDGES,
                    EON_str(kv['value']['Tuple'][0]), "node-RESULT", null, P_NODE);
                break;

            case /^tcache : 'find'/.test(kv['key']):
                var calc = EON_str(kv['value']['Tuple'][1]['Tuple'][0]);
                var rhs;
                if (/^{"calc",/.test(calc)){
                    rhs = ' : '+ 'no entry';
                } else {
                    rhs = ' : '+ calc;
                }
                var subtitle =         kv['value']['Tuple'][0]['Tuple'][0]  +' ' // variable
                             + EON_str(kv['value']['Tuple'][0]['Tuple'][1]) +' '
                             + EON_str(kv['value']['Tuple'][0]['Tuple'][2]) +' '
                             + rhs;
                P_NODE = TREE_add_leaf_simple(NODES,EDGES, 'Cache find', "node-CACHE", subtitle, P_NODE);
                break;

            case /^tcache : 'add_update'/.test(kv['key']):
                var subtitle =         kv['value']['Tuple'][0]  +' ' // variable
                             + EON_str(kv['value']['Tuple'][1]) +' '
                             + EON_str(kv['value']['Tuple'][2]) +' = '
                             + EON_str(kv['value']['Tuple'][3]);
                P_NODE = TREE_add_leaf_simple(NODES,EDGES, 'Cache add', "node-CACHE", subtitle, P_NODE);
                break;

            case /^tthread : 'creating_n_threads'/.test(kv['key']):
                var to     = EON_str(kv['value']['Tuple'][0]);
                var amount =         kv['value']['Tuple'][1]; // uint
                var pids   = EON_str(kv['value']['Tuple'][2]);
                FORKS[to] = {'n':amount, 'pids':pids};
                break;

            case /^tthread : 'thread_evaluated'/.test(kv['key']):
                var to     = EON_str(kv['value']['Tuple'][0]);
                var from   = EON_str(kv['value']['Tuple'][1]['Tuple'][5]);
                var input  = EON_str(kv['value']['Tuple'][1]['Tuple'][0]);
                var output = EON_str(kv['value']['Tuple'][2]['Tuple'][0]);
                var parent_id;
                if (FORKS[to]['start'] === undefined){
                    // Pool start node does not exist yet.
                    parent_id = TREE_add_leaf_simple(NODES,EDGES, "Pool "+to, "node-POOL");
                    // Register its id to the set of nodes-that-forks.
                    FORKS[to]['start'] = parent_id;
                } else {
                    parent_id = FORKS[to]['start'];
                }
                // Fill the fork
                parent_id = TREE_add_leaf_simple(NODES,EDGES, i(input), 'node-INPUT',  null, parent_id);
                parent_id = TREE_add_leaf_simple(NODES,EDGES, from,     'node-THREAD', null, parent_id);
                parent_id = TREE_add_leaf_simple(NODES,EDGES, output,   'node-RESULT', null, parent_id);
                // Attach fork to pool's end
                if (FORKS[to]['end'] === undefined){
                    // Pool finish node does not exist yet.
                    FORKS[to]['end'] = TREE_add_leaf_simple(NODES,EDGES, to, "node-POOL");
                    FORKS[to]['end_node_pos'] = NODES.length -1; // Store current pos
                } else {
                    // Make last node created point to pool's end
                    EDGES.push(new_edge(NODES[NODES.length -1]['id'], FORKS[to]['end']));
                    // Move pool's end node to last place of NODES array in order to restitute
                    //   root flow's place
                }
                if (--FORKS[to]['n'] === 0){
                    // That was the last thread of the pool.
                    P_NODE = FORKS[to]['end'];
                    delete FORKS[to];
                }
                break;

            case /^tcore : 'primop_apply'/.test(kv['key']):
                var op = EON_str(kv['value']['Tuple'][0]).match(/\.([^\.]+)\./)[1];
                var args = kv['value']['Tuple'][1]; // …[0] and …[1] only
                var input  = EON_str(args[0]) +' '+op+' '+ EON_str(args[1]);
                var output = EON_str(kv['value']['Tuple'][2]);
                P_NODE = TREE_add_leaf_simple(NODES,EDGES, i(input), 'node-INPUT',  null, P_NODE);
                P_NODE = TREE_add_leaf_simple(NODES,EDGES, output,   'node-RESULT', null, P_NODE);
                break;

            default:
                console.log("NOT USING "+ JSON.stringify(kv));
                UNUSED.push(kv);
                break;
        }
    } catch(e){ console.log("ILL FORMED: (Got '"+e+"') "+JSON.stringify(kv)); }
    });

    ///TEMPORARY
    // Moves 'title': and 'subtitle': into 'label':.
    for (var i = 0, n = NODES.length; i < n; i += 1){
        var title = NODES[i].title || '';
        var subtitle = NODES[i].subtitle;
        NODES[i]["label"] = title + (subtitle ? ' | '+subtitle : '');
    };

    renderText2(NODES, EDGES);
    return UNUSED;
};

function TREE_add_leaf_simple(nodes, edges, Ntitle, Nclass, Nsubtitle, parent_node_id){
    Nclass         = Nclass         || 'node-O';
    Nsubtitle      = Nsubtitle      || '';
    var p_node_id = nodes.length -1;
    parent_node_id = parent_node_id || p_node_id;

    var p_node = nodes[p_node_id], p_edge = edges[edges.length -1];
    var n_node_id = 1 + p_node_id;
    var n_node = {id:n_node_id+[], nodeclass:Nclass, title:Ntitle, subtitle:Nsubtitle};
    nodes.push(n_node);
    if (nodes.length === 1) return;
    var n_edge = new_edge(parent_node_id, n_node['id']);
    edges.push(n_edge);
    return n_node_id;
};

function EONS_set_unused (unused){
    unused = unused || [];
    // Set ‘unused’ flag in var eons.
    for (var i = 0, n = unused.length; i < n; i += 1){
        $('.id-text').each(function(index, tag){
            var time = $(this);
            if (time.text() == unused[i]['time']){
                time.parent().addClass('unused-text');
            }
        });
    }
}

// var new_id = function(){
//     // All my JS wat : http://stackoverflow.com/a/1535650/1418165
//     var counter = 0;
//     return function(){ return counter++ };
// }();

function new_edge (from, to){
    // from, to: must be integers or strings of integers.
    return {'source':from+[], 'target':to+[], 'id':from +'-'+ to};
};

function TREE_get_keyvalues(eons){
    var kvs = [];
    eons.sort(function(l,r){ l.time < r.time ? -1 : l.time > r.time });/////
    eons.forEach(function(eon){
        var name = EON_str(eon['name']).replace(/"/g, '');
        var desc = EON_str(eon['desc']).replace(/"/g, '\'');;
        var key = name +' : '+ desc;
        var value = eon['data'];
        var kv = {'key':key, 'value':value, 'time':eon['time']};
        kvs.push(kv);
    });
    return kvs;
};

function renderText2(nodes, edges){
    // console.log(JSON.stringify({"nodes":nodes}));////////////////////////////////////////////////////////////////
    // console.log(JSON.stringify({"edges":edges}));////////////////////////////////////////////////////////////////
    renderJSObjsToD3(nodes, edges, ".main-svg");
};

function buildGraphData(node, nodes, links){
    var index = nodes.length;
    nodes.push({
        name: node.data.content,
        group: 1
    });

    node.children.forEach(function (e){
        links.push({
            source: index,
            target: nodes.length,
            value: 2
        });
        buildGraphData(e, nodes, links);
    });
}
