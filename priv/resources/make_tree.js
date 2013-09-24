/* ‘dataParsed’ holds the JSON tree. */

var input = $("#sentence_input");
input.keypress(function (e) {
  if (e.which == 13) {
    renderText(input.val());
    e.preventDefault();
  }
});

function renderText() {
   var nodes = {};
   var edges = [];

   dataParsed.forEach(function (e) {
     populate(e, nodes, edges);
   });

   renderJSObjsToD3(nodes, edges, ".main-svg");
}

function populate(data, nodes, edges) {
  var nodeID = Object.keys(nodes).length;

  var newNode = {
	  label: (data.data.word) ? data.data.word : data.data.type,
    id: nodeID + ""
  };

  var classes = ["type-" + data.data.type];
  if (data.data.ne) {
    classes.push("ne-" + data.data.ne);
  }

  newNode.nodeclass = classes.join(" ");

  //  I hate javascript
  nodes[nodeID] = newNode;

  data.children.forEach(function (child) {
    var newChild = populate(child, nodes, edges);

    edges.push({
      source: newNode.id,
      target: newChild.id,
      id: newNode.id + "-" + newChild.id
    });
  });

  return newNode;
}


function buildGraphData(node, nodes, links) {
  var index = nodes.length;
  nodes.push({
    name: node.data.content,
    group: 1
  });

  node.children.forEach(function (e) {
    links.push({
      source: index,
      target: nodes.length,
      value: 2
    });
    buildGraphData(e, nodes, links);
  });
}

// renderText();
