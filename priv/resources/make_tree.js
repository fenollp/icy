/* Colors: O PERSON DATE ORGANIZATION LOCATION ORDINAL NUMBER
Usage:
  renderText(dataParsed); */

function renderText2(nodes, edges){
  console.log(JSON.stringify({"nodes":nodes}));////////////////////////////////////////////////////////////////
  console.log(JSON.stringify({"edges":edges}));////////////////////////////////////////////////////////////////
  renderJSObjsToD3(nodes, edges, ".main-svg");
};

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
