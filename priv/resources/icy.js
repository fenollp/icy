/* Icy lib */

function EON (e_string) { // Erlang Object Notation :d
    var obj = $.parseJSON(eval(e_string));
    console.log('RECV: ' + JSON.stringify(obj));
    return {name: obj["Erlang"]["Tuple"].shift(),
            time: obj["Erlang"]["Tuple"].shift(),
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
        tag.text(tag.text() + EON_str(obj) + sep);
    });
};

function EON_str (obj){
    var text = JSON.stringify(obj.data);
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
    return obj.name + ' ---> ' + text;
};



function TREE_threads (eons){
    var nodes = {}, edges = [];
    if (jQuery.isEmptyObject(eons)) return;
    var n = eons.length;
    for (var k = 0; k < n; k += 1){
        // Create node
        nodes[k] = {'id':k+[], 'label':eons[k].name, 'nodeclass':"type-undefined"};

        // Create edge
        edges.push(new_edge(k, k+1));
    }
    edges[edges.length -1] = new_edge(n -1, n);
    nodes[n] = {'id':n+[], 'label':"R", 'nodeclass':"node-DATE"};
    n += 1;
    nodes[n] = {'id':n+[], 'label':"ROOT", 'nodeclass':"node-O"};
    edges.push(new_edge(n, 0));
    n += 1;
    renderText2(nodes, edges);
    return;

    function TREE_fold (Children){
        return [
        {data:{word:"ƒ"}, children:[
            {data:{ne:"NUMBER", word:"Jolie1"}, children:[]},
            {data:{ne:"O", pos:"NN", type:"TK", word:"Jolie"}, children:Children}]}];
    };
};

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
