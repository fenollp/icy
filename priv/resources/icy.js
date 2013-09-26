/* Icy lib */

function EON (e_string) { // Erlang Object Notation :d
    var obj = $.parseJSON(eval(e_string));
    console.log('RECV: ' + JSON.stringify(obj));
    return {name: obj["Erlang"]["Tuple"].shift(),
            time: obj["Erlang"]["Tuple"].shift(),
            desc: obj["Erlang"]["Tuple"].shift(),
            data: obj["Erlang"]["Tuple"][0]};
};

function EONS_print (eons, tag, placeholder, sep) {
    // Sort eons by timestamp
    eons = eons.sort(function(l,r){
        if (l.time < r.time) return -1;
        if (l.time > r.time) return  1;
        return 0;
    });
    tag.text(placeholder);
    eons.forEach(function(obj){
        tag.text(tag.text() +
            obj.name + ' “'+obj.desc+'”' +' ⟼ '+ EON_str(obj.data) + sep);
    });
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



function TREE_threads (eons){
    if ($.isEmptyObject(eons)) return;
    var nodes = [], edges = [], unused = []; /// MAY display unused (id='time':) differently?

    var kvs = TREE_get_keyvalues(eons);
    kvs.forEach(function(kv){
        // Careful with multiple branches. Create|close them in a single case: or otherwise…
        switch (true){
            case /tea : 'i'/.test(kv['key']) && nodes.length == 0:
                var root = {id:"0", nodeclass:"node-ROOT",
                            title: kv['value']['Tuple'][1]};
                nodes.push(root);
                break;
            case /tea : 'result'/.test(kv['key']) && nodes.length != 0:
                TREE_add_leaf_simple(nodes, edges, "result", "node-END", kv['value']['Tuple'][0]);
                break;
            case /tcache : 'find'/.test(kv['key']):
                
                break;
            default:
                unused.push(kv);
                break;
        }
    });
    console.log("UNUSED: "+JSON.stringify(unused));

    ///TEMPORARY
    // Move 'title': and 'subtitle': into 'label':.
    for (var i = 0, n = nodes.length; i < n; i += 1){
        var title = nodes[i].title || '';
        nodes[i]["label"] = title + ((nodes[i].subtitle) ? ' | '+EON_str(nodes[i].subtitle) : '');
    };

    renderText2(nodes, edges);
};

function TREE_add_leaf_simple(nodes, edges, Ntitle, Nclass, Nsubtitle){
    Nclass = Nclass || 'node-O';
    Nsubtitle = Nsubtitle || '';
    var p_node = nodes[nodes.length -1];
    var p_edge = edges[edges.length -1];
    var last_node = {id:nodes.length+[], nodeclass:Nclass, title:Ntitle, subtitle:Nsubtitle};
    nodes.push(last_node);
    var last_edge = new_edge(p_node['id'], last_node['id']);
    edges.push(last_edge);
};

var new_id = function(){
    // All my JS wat : http://stackoverflow.com/a/1535650/1418165
    var counter = 0;
    return function(){ return counter++ };
}();

function new_edge (from, to){
    // from, to: must be integers or strings of integers.
    return {'source':from+[], 'target':to+[], 'id':from +'-'+ to};
};

function TREE_get_keyvalues(eons){
    var kvs = [];
    eons.forEach(function(eon){
        var name = EON_str(eon['name']).replace(/"/g, '');
        var desc = EON_str(eon['desc']).replace(/"/g, '\'');;
        var key = name +' : '+ desc;
        var value = eon['data'];
        var kv = {'key':key, 'value':value, 'time':eon['time']};
        kvs.push(kv);
        console.log("KV: "+JSON.stringify(kv));
    });
    return kvs;
};

function renderText2(nodes, edges){
    console.log(JSON.stringify({"nodes":nodes}));////////////////////////////////////////////////////////////////
    console.log(JSON.stringify({"edges":edges}));////////////////////////////////////////////////////////////////
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
