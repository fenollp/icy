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
        tag.text(tag.text() + obj.name +' ---> '+ EON_str(obj.data) + sep);
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



function create_root (nodes, edges, eons, mod_map) {
    console.log("ICI");
    console.log("EONS: "+JSON.stringify(mod_map));
    var data = "ROOT";
    if (mod_map['tea'] !== undefined){
        if (mod_map['tea'][0]['Tuple'] !== undefined){
            if (mod_map['tea'][0]['Tuple'][0] === "i"){
                mod_map['tea'][0]['Tuple'].shift();
                data = mod_map['tea'][0]['Tuple'][0];
                delete mod_map['tea'];
            }
        }
    }
    var id = new_id();
    nodes[id] = {'id':id+[], 'label':data, 'nodeclass':"node-ROOT"};
    return id;
};

function get_keyvalues(eons){
    var kvs = [];
    eons.forEach(function(eon){
        var name = EON_str(eon['name']).replace(/"/g, '');
        var desc = EON_str(eon['desc']).replace(/"/g, '\'');;
        var key = name +' : '+ desc;
        var value = eon['data'];
        kvs.push({'key':key, 'value':value});
    });
    return kvs;
};

function TREE_threads (eons){
    var nodes = {}, edges = [];
    if (jQuery.isEmptyObject(eons)) return;

    var kv = get_keyvalues(eons);
    console.log("KV: "+JSON.stringify(kv));

    var mod_map = order_eons_by_name(eons);
    var iddd;
    iddd = create_root(nodes, edges, eons, mod_map);
    console.log("ROOT: "+JSON.stringify(nodes));

    var n = eons.length;
    for (var k = 0; k < n; k += 1){
        console.log("iddd = "+ iddd);
        var newId = new_id();
        // Create edge
        edges.push(new_edge(iddd, newId));
        // Create node
        var data = eons[k].name + ' : ' + EON_str(eons[k].data);
        nodes[newId] = {'id':newId+[], 'label':data, 'nodeclass':"type-undefined"};
    }
    // Add bottom element
    // nodes[n] = {'id':n+[], 'label':"R", 'nodeclass':"node-DATE"};
    // edges[edges.length -1] = new_edge(n -1, n);
for (var i = 0, n = Object.keys(nodes).length; i < n; i += 1){
    if (nodes[i] !== undefined) console.log("ID "+i);
}
    // var mod_map = order_eons_by_name(eons);
    // // Rework tree
    // for (var k = 0; k < n; k += 1){
    //     switch (eons[k].name){
    //         case 'tea':
    //             if (mod_map['tea']['Tuple']['i'] !== undefined){
    //                 // This is 
    //             }
    //             break;
    //         default:
    //             // Remove node & edges
    //             // console.log("Node removed = "+ …);
    //             break;
    //     }
    // }

    renderText2(nodes, edges);
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

function order_eons_by_name (eons){
    // At this point eons is already time-ordered,
    //   listings will thus be also ordered.
    var listings = {};
    eons.forEach(function(eon){
        if (listings[eon.name] === undefined){
            listings[eon.name] = [];
        }
        listings[eon.name].push(eon.data);
    });
    return listings;
};

/* Colors: O PERSON DATE ORGANIZATION LOCATION ORDINAL NUMBER
Usage:
  renderText(dataParsed); */

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
