const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    baseTemp = data.baseTemperature;
    dataset = data.monthlyVariance;

    const svgWidth = 800;
    const svgHeight = 500;

    const padding = 70;

    let svg = d3.select(".svg-content")
                .append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);

    const xScale = d3.scaleLinear()
                     .domain([d3.min(dataset, data => data["year"]), d3.max(dataset, data => data["year"]) + 1])
                     .range([padding, svgWidth - padding]);

    const yScale = d3.scaleTime()
                     .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
                     .range([padding, svgHeight - padding]);

    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.timeFormat("%B"));

    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", "translate(0," + (svgHeight - padding) + ")")
       .call(xAxis);

    svg.append("g")
       .attr("id", "y-axis")
       .attr("transform", "translate(" + padding + ",0)")
       .call(yAxis);

    let tooltip = d3.select("body")
                    .append("div")
                    .attr("id", "tooltip")
                    .style("opacity", 0)
                    .style("display", "flex")
                    .style("align-items", "center")
                    .style("justify-content", "flex-start")
                    .style("position", "absolute")
                    .style("text-align", "left")
                    .style("width", "auto")
                    .style("height", "auto")
                    .style("padding", "6px")
                    .style("font-size", "12px")
                    .style("background-color", "lightsteelblue")
                    .style("box-shadow", "1px 1px 10px")
                    .style("border-radius", "2px")
                    .style("pointer-events", "none");

    svg.selectAll("rect")
       .data(dataset)
       .enter()
       .append("rect")
       .attr("class", "cell")
       .attr("fill", data => {
          if(data["variance"] <= -1) {
            return "SteelBlue";
          }
          else if (data["variance"] <= 0) {
            return "LightBlue";
          }
          else if (data["variance"] <= 1) {
            return "Orange";
          }
          else {
            return "Red";
          }
       })
       .attr("data-year", data => {
          return data["year"];
       })
       .attr("data-month", data => {
          return data["month"] - 1;
       })
       .attr("data-temp", data => {
          return baseTemp + data["variance"];
       })
       .attr("width", () => {
          let minYear = d3.min(dataset, data => {
            return data["year"];
          });

          let maxYear = d3.max(dataset, data => {
            return data["year"];
          });

          let yearCount = maxYear - minYear;

          return (svgWidth - (2 * padding)) / yearCount;
       })
       .attr("x", data => {
          return xScale(data["year"]);
       })
       .attr("height", () => {
          return (svgHeight - (2 * padding)) / 12;
       })
       .attr("y", data => {
          return yScale(new Date(0, data["month"] -1, 0, 0, 0, 0, 0));
       })
       .on("mouseover", (data, index) => {
          tooltip.transition()
                 .style("opacity", 1)
                 .style("left", data.pageX + "px")
                 .style("top", data.pageY + "px");

          let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

          document.querySelector("#tooltip").setAttribute("data-year", index["year"]);
          document.querySelector("#tooltip").innerHTML =
          index["year"] + " - " + monthNames[index["month"] - 1] + "," +
          "<br />" +
          "Temperature: " + d3.format(".1f")(baseTemp + index["variance"]) + "&#8451;" + "," +
          "<br />" +
          "Variance: " + index["variance"] + "&#8451;" + ".";
       })
       .on("mouseout", () => {
          tooltip.transition()
                 .style("opacity", 0)
       });
  }
)
