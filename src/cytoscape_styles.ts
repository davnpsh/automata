const cytoscape_styles = [
  {
    selector: "node.invisible",
    style: {
      opacity: 0,
      label: "",
    },
  },
  {
    selector: "node.accept",
    style: {
      "border-width": 3,
      "background-image":
        "data:image/svg+xml;utf8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <circle cx="50%" cy="50%" r="38%" fill="white" stroke="black" stroke-width="4"/>
          </svg>
        `),
      "background-width": "100%",
      "background-height": "100%",
    },
  },
  {
    selector: "node",
    style: {
      "background-color": "#fff",
      "border-color": "#000",
      "border-width": 1,
      label: "data(id)",
      "text-valign": "center",
      "text-halign": "center",
      width: 20,
      height: 20,
      "font-size": "8px",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1,
      "line-color": "#000",
      "target-arrow-color": "#000",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      label: "data(label)",
      "text-rotation": "autorotate",
      "text-margin-y": -5,
      "font-size": "6px",
      "arrow-scale": 0.8,
    },
  },
  {
    selector: "edge.start",
    style: {
      "source-endpoint": "outside-to-line",
      "target-endpoint": "outside-to-line",
      "source-distance-from-node": 40,
      "target-distance-from-node": 0,
      "source-arrow-shape": "none",
      "line-style": "dashed",
    },
  },
];

export { cytoscape_styles };
