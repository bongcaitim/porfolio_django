function createParallelPlot(column1, column2, column3) {
    var margin = { top: 90, right: 100, bottom: 60, left: 100 },
      width = 900,
      height = 700;
  
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
  
    var svg = d3
      .select("body")
      .append("svg")
      .attr("class", "parallel")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    d3.csv("{% static 'pfl_app/data/scatter_data.csv' %}").then((data) => {
      var dimensions = [column1, column2, column3];
  
      var yScales = {};
      dimensions.forEach((dim) => {
        yScales[dim] = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => +d[dim]))
          .range([0, innerHeight]);
      });
  
      var xScale = d3.scalePoint().domain(dimensions).range([0, innerWidth]);
  
      function path(d) {
        return d3.line()(dimensions.map((p) => [xScale(p), yScales[p](+d[p])]));
      }
      const defaultOpacity = 0.15;
      var lines = svg
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke-width", 4)
        .style("fill", "none")
        .style("stroke", "#006989")
        .style("opacity", defaultOpacity);
  
      dimensions.forEach((dim) => {
        svg
          .append("g")
          .attr("transform", `translate(${xScale(dim)},0)`)
          .each(function () {
            d3.select(this).call(d3.axisLeft(yScales[dim]));
          })
          .append("text")
          .style("text-anchor", "middle")
          .attr("y", innerHeight + 20)
          .text(dim);
      });
  
      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#ffffe3")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("z-index", "10");
  
      lines
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible").html(`${d["Tên mặt hàng"]}
                        <br>${column1}: ${d[column1]}
                        <br>${column2}: ${d[column2]}
                        <br>${column3}: ${d[column3]}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 40 + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          var clicked = d3.select(this);
          var isSelected = clicked.classed("selected");
  
          svg.selectAll(".item-label").remove();
  
          if (isSelected) {
            lines
              .style("opacity", defaultOpacity)
              .attr("stroke-width", 4)
              .classed("selected", false);
          } else {
            lines.style("opacity", defaultOpacity - 0.1).attr("stroke-width", 4);
            clicked
              .style("opacity", 1)
              .attr("stroke-width", 4)
              .classed("selected", true);
  
            svg
              .append("text")
              .attr("class", "item-label")
              .attr("x", innerWidth + 5)
              .attr("y", yScales[column3](d[column3]))
              .text(d["Tên mặt hàng"])
              .call(wrap, margin.right - 10);
  
            function wrap(text, width) {
              text.each(function () {
                var text = d3.select(this),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line = [],
                  x = text.attr("x"),
                  dy = 0,
                  lineHeight = 12;
                tspan = text
                  .text(null)
                  .append("tspan")
                  .attr("x", x)
                  .attr("dy", dy + "px");
                while ((word = words.pop())) {
                  line.push(word);
                  tspan.text(line.join(" "));
                  if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text
                      .append("tspan")
                      .attr("x", x)
                      .attr("dy", ++lineHeight + "pt")
                      .text(word);
                  }
                }
              });
            }
          }
        });
  
      svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Parallel Coordinates");
    });
  }
  
  /////////////////////////////////////////////
  function createHeatMap() {
    const margin = { top: 90, right: 80, bottom: 40, left: 250 },
      width = 800,
      height = 1200;
  
    var innerWidth = 800 - margin.left - margin.right,
      innerHeight = 1200 - margin.top - margin.bottom;
  
    const svg = d3
      .select("body")
      .append("svg")
      .attr("class", "heatmap")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    d3.csv("data/heatmap.csv").then((data) => {
      const yLabels = Array.from(new Set(data.map((d) => d["Tên mặt hàng"])));
      const xLabels = Array.from(new Set(data.map((d) => d["Mã PKKH"])));
  
      const xScale = d3
        .scaleBand()
        .range([0, innerWidth])
        .domain(xLabels)
        .padding(0.01);
  
      const yScale = d3
        .scaleBand()
        .range([0, innerHeight])
        .domain(yLabels)
        .padding(0.01);
  
      const colorScale = d3
        .scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([0, 1]);
  
      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#ffffe3")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("z-index", "10");
  
      svg
        .append("g")
        .attr(
          "transform",
          "translate(0," + (height - margin.top - margin.bottom) + ")"
        )
        .call(d3.axisBottom(xScale))
        .selectAll("text");
  
      svg
        .append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("class", "y-tick-labels")
        .call(wrap, margin.left - 20);
  
      svg
        .selectAll()
        .data(data, (d) => d["Mã PKKH"] + ":" + d["Mã mặt hàng"])
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d["Mã PKKH"]))
        .attr("y", (d) => yScale(d["Tên mặt hàng"]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", (d) => colorScale(d.percentage))
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible").html(`${
            d["Mã PKKH"]
          } - <strong>${d["Mô tả Phân Khúc Khách hàng"]}</strong>
                        <br>${d["Mã mặt hàng"]} - <strong>${
            d["Tên mặt hàng"]
          }</strong>
                        <br>Xác suất: ${(d.percentage * 100).toFixed(0)}%`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 40 + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
      svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Heatmap - Xác suất mua mặt hàng của từng PKHH");
  
      function wrap(text, width) {
        text.each(function () {
          const text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy"));
          let word,
            line = [],
            lineNumber = 0,
            tspan = text
              .text(null)
              .append("tspan")
              .attr("x", -10)
              .attr("y", y)
              .attr("dy", dy + "em");
  
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", -10)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
            }
          }
        });
      }
    });
  }
  
  ////////////////////////////////////////////////////
  function createWordCloud() {
    var width = 800;
    var height = 400;
  
    // Create the SVG element and append it to the body
    var svg = d3
      .select("body")
      .append("svg")
      .attr("class", "wordcloud")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
    // Load the JSON data
    d3.json("data/data.json").then((data) => {
      let rollupData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d["Thành tiền"]),
        (d) => d["Tên nhóm hàng"]
      );
  
      let wordData = Array.from(rollupData, ([key, value]) => ({
        text: key,
        size: value / 16,
      }));
  
      var fontSizeScale = d3
        .scaleLinear()
        .domain([0, d3.max(wordData, (d) => d.size)])
        .range([10, 100]);
  
      d3.layout
        .cloud()
        .size([width, height])
        .words(wordData)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .fontSize((d) => fontSizeScale(d.size))
        .on("end", draw)
        .start();
  
      // Function to draw the word cloud
      function draw(words) {
        svg
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", (d) => +d.size + "px")
          .style("fill", () => d3.schemeDark2[Math.floor(Math.random() * 10)])
          .attr("text-anchor", "middle")
          .attr(
            "transform",
            (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
          )
          .text((d) => d.text);
      }
    });
  }
  ////////////////////////////////////////////////////
  function barRevBySeg() {
    const width = 900;
    const height = 700;
    const margin = { top: 90, right: 80, bottom: 40, left: 250 }; 
  
    var chartSvg = d3
      .select("body")
      .append("svg")
      .attr("class", "rev-by-segment")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    d3.json("data/data.json").then(function (data) {
      const new_descriptions = {
        A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
        A2: "Người đi làm tại gia, nội trợ",
        A3: "Mẹ bỉm sữa",
        B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
        B2: "Học sinh, sinh viên",
        B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
        C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
        C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
        C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
      };
  
      const nestedData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d["Thành tiền"]),
        (d) => d["Mã PKKH"]
      );
  
      let processedData = Array.from(nestedData, ([key, value]) => ({
        key,
        value,
        description: new_descriptions[key] || "No description available",
      }));
  
      processedData.sort((a, b) => d3.ascending(a.key, b.key));
  
      var x = d3
        .scaleLinear()
        .domain([0, d3.max(processedData, (d) => d.value)])
        .range([0, width - margin.left - margin.right]);
  
      var y = d3
        .scaleBand()
        .domain(processedData.map((d) => `${d.key} - ${d.description}`))
        .range([0, height - margin.top - margin.bottom])
        .padding(0.1);
  
      chartSvg
        .append("g")
        .attr("class", "x-axis")
        .attr(
          "transform",
          "translate(0," + (height - margin.top - margin.bottom) + ")"
        );
      chartSvg.append("g").attr("class", "y-axis");
  
      chartSvg
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "y-tick-labels")
        .call(wrap, 200);
  
      function wrap(text, width) {
        text.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            x = text.attr("x"),
            dy = -18,
            lineHeight = 12; //parseFloat(text.attr("dy")),
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("dy", dy + "px");
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("dy", ++lineHeight + "pt")
                .text(word);
            }
          }
        });
      }
  
      chartSvg
        .selectAll(".bar")
        .data(processedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", (d) => y(`${d.key} - ${d.description}`))
        .attr("width", (d) => x(d.value))
        .attr("height", y.bandwidth())
        .attr("fill", "#102C57");
  
      chartSvg
        .selectAll(".label")
        .data(processedData)
        .join("text")
        .attr("class", "label")
        .attr("x", (d) => x(d.value) + 10)
        .attr("y", (d) => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .text((d) => `${(d.value / 1e6).toFixed(2)}M`);
  
      chartSvg.selectAll(".domain").remove();
      chartSvg.selectAll(".tick line").remove();
  
      chartSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Doanh thu theo phân khúc khách hàng");
    });
  }
  
  ///////////////////////////////////////
  
  function changeDataPlot() {
    function update(dataType) {
      loadData(function (data) {
        var sumData = d3.rollup(
          data,
          (v) => d3.sum(v, (d) => d["Thành tiền"]),
          (d) => d[dataType === "data1" ? "Tên nhóm hàng" : "Tên mặt hàng"]
        );
  
        sumData = Array.from(sumData, ([key, value]) => ({ key, value }));
  
        // Sort sumData by value in descending order
        sumData.sort((a, b) => d3.descending(a.value, b.value));
  
        x.domain([0, d3.max(sumData, (d) => d.value)]);
        y.domain(sumData.map((d) => d.key));
  
        // Update x axis
        secondSvg
          .select(".x-axis")
          .call(d3.axisBottom(x))
          .selectAll("text") // Select all text elements of x-axis ticks
          .remove(); // Remove them
  
        // Update y axis
        secondSvg
          .select(".y-axis")
          .transition()
          .duration(1000)
          .call(d3.axisLeft(y));
  
        // Append data labels to bars
        secondSvg.selectAll(".data-label").remove();
        var uLabels = secondSvg.selectAll(".data-label").data(sumData);
  
        uLabels
          .enter()
          .append("text")
          .attr("class", "data-label")
          .merge(uLabels)
          .transition()
          .duration(1000)
          .attr("x", function (d) {
            return x(d.value) + 10;
          })
          .attr("y", function (d) {
            return y(d.key) + y.bandwidth() / 2;
          })
          .text(function (d) {
            return (d.value / 1000000).toFixed(1) + "M";
          });
  
        secondSvg.selectAll(".domain").remove();
        secondSvg.selectAll(".tick line").remove();
  
        secondSvg.selectAll("rect").remove();
  
        var u = secondSvg.selectAll("rect").data(sumData);
  
        u.enter()
          .append("rect")
          .merge(u)
          .transition()
          .duration(1000)
          .attr("y", function (d) {
            return y(d.key);
          })
          .attr("height", y.bandwidth())
          .attr("x", 0)
          .attr("width", function (d) {
            return x(d.value);
          })
          .attr("fill", "#344955");
  
        secondSvg.selectAll(".chart-title").remove();
        secondSvg
          .append("text")
          .attr("class", "chart-title")
          .attr("x", -secondMargin.left + 50)
          .attr("y", -20)
          .attr("text-anchor", "start")
          .text("Doanh thu theo Nhóm hàng - Mặt hàng");
      });
    }
  
    function loadData(callback) {
      d3.json("data/data.json").then(function (data) {
        callback(data);
      });
    }
  
    var secondMargin = { top: 90, right: 80, bottom: 40, left: 250 },
      secondWidth = 900,
      secondHeight = 700;
  
    var secondSvg = d3
      .select("body")
      .append("svg")
      .attr("class", "rev-by-item")
      .attr("width", secondWidth)
      .attr("height", secondHeight)
      .append("g")
      .attr(
        "transform",
        "translate(" + secondMargin.left + "," + secondMargin.top + ")"
      );
  
    var x = d3
      .scaleLinear()
      .range([0, secondWidth - secondMargin.left - secondMargin.right]);
  
    var y = d3
      .scaleBand()
      .range([0, secondHeight - secondMargin.top - secondMargin.bottom])
      .padding(0.1);
  
    // X axis group
    secondSvg
      .append("g")
      .attr("class", "x-axis")
      .attr(
        "transform",
        "translate(0," +
          (secondHeight - secondMargin.top - secondMargin.bottom) +
          ")"
      );
  
    // Y axis group
    secondSvg.append("g").attr("class", "y-axis");
  
    // Create buttons for data type selection
    d3.select("body").append("br");
  
    d3.select("body")
      .append("button")
      .text("Nhóm hàng")
      .on("click", function () {
        update("data1");
      });
  
    d3.select("body")
      .append("button")
      .text("Mặt hàng")
      .on("click", function () {
        update("data2");
      });
  
    d3.select("body").append("br");
  
    // Initial update with default data type
    update("data1");
  }
  
  //////////////
  function createRevByMonthChart(container, dataFilePath) {
    var thirdMargin = { top: 90, right: 80, bottom: 40, left: 100 },
      thirdWidth = 900,
      thirdHeight = 400;
  
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("z-index", "10");
  
    d3.select("body").append("br");
  
    var thirdSvg = d3
      .select(container)
      .append("svg")
      .attr("class", "rev-by-month")
      .attr("width", thirdWidth)
      .attr("height", thirdHeight)
      .append("g")
      .attr(
        "transform",
        "translate(" + thirdMargin.left + "," + thirdMargin.top + ")"
      );
  
    var innerWidth = thirdWidth - thirdMargin.left - thirdMargin.right;
    var innerHeight = thirdHeight - thirdMargin.top - thirdMargin.bottom;
    d3.json(dataFilePath).then(function (data) {
      // Y axis
      var y = d3.scaleLinear().range([innerHeight, 0]);
  
      // X axis
      var x = d3.scaleBand().range([0, innerWidth]).padding(0.1);
  
      var xAxis = d3.axisBottom(x);
      var yAxis = d3.axisLeft(y).ticks(2); 
  
      thirdSvg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis);
  
      thirdSvg.append("g").attr("class", "y-axis").call(yAxis);
  
      var sumData = Array.from(
        d3.rollup(
          data,
          (v) => d3.sum(v, (d) => d["Thành tiền"]),
          (d) => d["Month"]
        ),
        ([key, value]) => ({ Month: key, sum: value })
      );
  
      x.domain(sumData.map((d) => d.Month));
      y.domain([0, d3.max(sumData, (d) => d.sum)]);
  
      var line = d3
        .line()
        .x((d) => x(d.Month) + x.bandwidth() / 2)
        .y((d) => y(d.sum));
  
      thirdSvg
        .append("path")
        .datum(sumData)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", "#102C57")
        .attr("stroke-width", 5)
        .style("fill", "none");
  
      thirdSvg
        .selectAll(".dot")
        .data(sumData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => x(d.Month) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.sum))
        .attr("r", 6)
        .attr("fill", "steelblue")
        .style("opacity", 0.5)
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .text(
              `Tháng: ${d.Month}, Doanh thu: ${(d.sum / 1e6).toFixed(1)} triệu`
            );
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 30 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
  
      thirdSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -thirdMargin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Doanh thu theo Tháng");
    });
  }
  
  ///////////////
  function createSmallMultiplesChart(dataFilePath, id, chartTitle, valueColumn) {
    d3.select("body").append("br");
    d3.select("body").append("p").attr("class", "chart-title").text(chartTitle);
    d3.select("body").append("br");
    d3.select("body").append("div").attr("class", "multiples").attr("id", id);
  
    var margin = { top: 80, right: 80, bottom: 40, left: 100 },
      width = 550,
      height = 230,
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;
  
    var svgContainer = d3
      .select(`#${id}`)
      .style("display", "grid")
      .style("grid-template-columns", `repeat(3, minmax(${width}px, 1fr))`)
      .style("grid-template-rows", `repeat(3, minmax(${height}px, 1fr))`)
      .style("gap", "10px");
  
    var tooltip = d3
      .select(`#${id}`)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("z-index", "10");
  
    d3.csv(dataFilePath).then(function (data) {
      var nestedData = d3.group(data, (d) => d["Mã PKKH"]);
  
      var color = d3.scaleOrdinal(d3.schemeCategory10);
  
      nestedData.forEach((values, key, map) => {
        var segmentDescription = values[0]["Mô tả Phân Khúc Khách hàng"];
  
        var x = d3
          .scaleBand()
          .domain(values.map((d) => d["Month"]))
          .range([0, innerWidth])
          .padding(0.1);
  
        var y = d3
          .scaleLinear()
          .domain([0, d3.max(values, (d) => +d[valueColumn])])
          .range([innerHeight, 0]);
  
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y).ticks(2);
  
        var line = d3
          .line()
          .x((d) => x(d["Month"]) + x.bandwidth() / 2)
          .y((d) => y(+d[valueColumn]));
  
        var svg = svgContainer
          .append("svg")
          .attr("class", "multiple")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
        svg
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(xAxis);
  
        svg.append("g").attr("class", "y-axis").call(yAxis);
  
        svg
          .append("path")
          .datum(values)
          .attr("class", "line")
          .attr("d", line)
          .attr("stroke", color(key))
          .attr("stroke-width", 3)
          .style("fill", "none");
  
        svg
          .selectAll(".dot")
          .data(values)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", (d) => x(d["Month"]) + x.bandwidth() / 2)
          .attr("cy", (d) => y(+d[valueColumn]))
          .attr("r", 4)
          .attr("fill", color(key))
          .style("opacity", 0.3)
          .on("mouseover", function (event, d) {
            if (valueColumn === "Thành tiền") {
              tooltip
                .style("visibility", "visible")
                .html(
                  `Tháng ${d["Month"]} <br> ${d["Mã PKKH"]} - ${
                    d["Mô tả Phân Khúc Khách hàng"]
                  }<br>Doanh thu: <strong>${(+d[valueColumn] / 1e6).toFixed(
                    1
                  )} triệu</strong>`
                );
            } else {
              tooltip
                .style("visibility", "visible")
                .html(
                  `Tháng ${d["Month"]} <br> ${d["Mã PKKH"]} - ${d["Mô tả Phân Khúc Khách hàng"]}<br>Tỉ lệ rời bỏ: <strong>${d[valueColumn]}%</strong>`
                );
            }
          })
          .on("mousemove", function (event) {
            tooltip
              .style("top", event.pageY - 10 + "px")
              .style("left", event.pageX + 50 + "px");
          })
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
          });
  
        svg
          .append("text")
          .attr("class", "subplot-title")
          .attr("x", -margin.left + 30)
          .attr("y", -30)
          .attr("text-anchor", "start")
          .text(segmentDescription)
          .call(wrap, width - 100);
  
        function wrap(text, width) {
          text.each(function () {
            var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              x = text.attr("x"),
              dy = -18,
              lineHeight = 12; //parseFloat(text.attr("dy")),
            tspan = text
              .text(null)
              .append("tspan")
              .attr("x", x)
              .attr("dy", dy + "px");
            while ((word = words.pop())) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text
                  .append("tspan")
                  .attr("x", x)
                  .attr("dy", ++lineHeight + "pt")
                  .text(word);
              }
            }
          });
        }
      });
    });
  }
  
  ////////////////////////////
  function timeBarGrid() {
    d3.select("body")
      .append("p")
      .attr("class", "chart-title")
      .text("Số đơn trung bình theo thời gian");
    d3.select("body").append("br");
  
    const gridContainer = d3
      .select("body")
      .append("div")
      .attr("class", "grid-container")
      .attr("id", "orders-by-time");
  
    const dataFiles = [
      {
        file: "data/DayofMonth_Summary.csv",
        id: "day-of-month",
        title: "Day of Month Summary",
        valueColumn: "AvgOrders",
        keyColumn: "DayofMonth",
      },
      {
        file: "data/DayofWeek_Summary.csv",
        id: "day-of-week",
        title: "Day of Week Summary",
        valueColumn: "AvgOrders",
        keyColumn: "DayofWeek",
      },
      {
        file: "data/HourofDay_Summary.csv",
        id: "hour-of-day",
        title: "Hour of Day Summary",
        valueColumn: "AvgOrders",
        keyColumn: "HourofDay",
      },
    ];
  
    dataFiles.forEach((dataFile, index) => {
      createBarChart(
        dataFile.file,
        dataFile.id,
        dataFile.title,
        dataFile.valueColumn,
        dataFile.keyColumn,
        index
      );
    });
  
    d3.select(".grid-container")
      .style("display", "grid")
      .style("grid-template-columns", "repeat(2, 1fr)")
      .style("grid-template-rows", "repeat(2, auto)")
      .style("gap", "10px");
  }
  
  function createBarChart(
    dataFilePath,
    id,
    chartTitle,
    valueColumn,
    keyColumn,
    index
  ) {
    const margin = { top: 40, right: 20, bottom: 40, left: 50 },
      width = 800 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;
  
    const chartContainer = d3
      .select(".grid-container")
      .append("div")
      .attr("class", "chart-container")
      .attr("id", id);
  
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("z-index", "10");
  
    d3.csv(dataFilePath).then((data) => {
      const svg = d3
        .select(`#${id}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "time-svg")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d[keyColumn]))
        .range([width, 0])
        .padding(0.2);
  
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => +d[valueColumn])])
        .nice()
        .range([height, 0]);
  
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
  
      svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
  
      svg
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d[keyColumn]))
        .attr("y", (d) => y(+d[valueColumn]))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(+d[valueColumn]))
        .style("fill", "#BED7DC")
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `Trung bình <strong>${(+d[valueColumn]).toFixed(1)}</strong> đơn`
            );
        })
  
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 30 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
  
      svg
        .append("text")
        .attr("class", "subplot-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(chartTitle);
    });
  }
  
  //////////
  
  function drillDownChart() {
    const width = 900;
    const height = 700;
    const margin = { top: 90, right: 80, bottom: 40, left: 150 };
  
    var chartSvg = d3
      .select("body")
      .append("svg")
      .attr("class", "rev-by-item-drilldown")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    Promise.all([
      d3.csv("data/rev_by_group.csv"),
      d3.csv("data/rev_by_item.csv"),
    ]).then(function (data) {
      const groupData = data[0];
      const itemData = data[1];
  
      const colorScale = d3
        .scaleOrdinal(d3.schemeCategory10)
        .domain(groupData.map((d) => d["Tên nhóm hàng"]));
  
      groupData.sort((a, b) => +a["Thành tiền"] - +b["Thành tiền"]);
      const groupNames = groupData.map((d) => d["Tên nhóm hàng"]);
  
      chartSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Doanh thu theo Nhóm/Mặt hàng drill down");
  
      const x = d3.scaleLinear().range([0, width - margin.left - margin.right]);
  
      const y = d3
        .scaleBand()
        .range([height - margin.top - margin.bottom, 0])
        .padding(0.1);
  
      createChart(groupData, groupNames, itemData, width, height, margin);
  
      function createChart(
        groupData,
        groupNames,
        itemData,
        width,
        height,
        margin
      ) {
        chartSvg.selectAll(".x-axis").remove();
        chartSvg.selectAll(".y-axis").remove();
        chartSvg.selectAll(".bar").remove();
  
        x.domain([0, d3.max(groupData, (d) => +d["Thành tiền"])]);
        y.domain(groupNames);
  
        chartSvg
          .append("g")
          .attr("class", "x-axis")
          .attr(
            "transform",
            "translate(0," + (height - margin.top - margin.bottom) + ")"
          )
          .call(d3.axisBottom(x).tickFormat((d) => d / 1e6 + "M"));
  
        chartSvg
          .append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .attr("class", "y-tick-labels");
  
        const bars = chartSvg.selectAll(".bar").data(groupData);
  
        bars
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => y(d["Tên nhóm hàng"]))
          .attr("height", y.bandwidth())
          .attr("width", (d) => x(+d["Thành tiền"]))
          .attr("fill", (d) => colorScale(d["Tên nhóm hàng"]))
          .on("click", function (event, d) {
            console.log("d ten nhom hàg:", d["Tên nhóm hàng"]);
            const filteredItems = itemData.filter(
              (item) => item["Tên nhóm hàng"] === d["Tên nhóm hàng"]
            );
            console.log("filteredItems:", filteredItems);
            updateChart(filteredItems, "Tên mặt hàng");
          });
      }
  
      function updateChart(data, keyColumn) {
        data.sort((a, b) => +a["Thành tiền"] - +b["Thành tiền"]);
  
        x.domain([0, d3.max(data, (d) => +d["Thành tiền"])]);
        y.domain(data.map((d) => d[keyColumn]));
  
        chartSvg
          .select(".x-axis")
          .transition()
          .duration(500)
          .call(d3.axisBottom(x).tickFormat((d) => d / 1e6 + "M"));
  
        chartSvg.select(".y-axis").transition().duration(500);
        chartSvg
          .select(".y-axis")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .attr("class", "y-tick-labels")
          .call(wrap, 100);
  
        const bars = chartSvg.selectAll(".bar").data(data, (d) => d[keyColumn]);
  
        bars.exit().transition().duration(300).attr("width", 0).remove();
  
        bars
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => y(d[keyColumn]))
          .attr("height", y.bandwidth())
          .attr("fill", (d) => colorScale(d["Tên nhóm hàng"]))
          .transition()
          .duration(500)
          .attr("width", (d) => x(+d["Thành tiền"]))
          .attr("y", (d) => y(d[keyColumn]))
          .each(function (d) {
            // chartSvg.selectAll(".bar").transition().duration(300).attr("width", 0);
            this.addEventListener("click", function () {
              createChart(groupData, groupNames, itemData, width, height, margin);
            });
          });
      }
  
      function wrap(text, width) {
        text.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            x = text.attr("x"),
            dy = -18,
            lineHeight = 12,
            tspan = text
              .text(null)
              .append("tspan")
              .attr("x", x)
              .attr("dy", dy + "px");
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("dy", ++lineHeight + "pt")
                .text(word);
            }
          }
        });
      }
  
      createChart(groupData, groupNames, itemData, width, height, margin);
      d3.select("body").append("br").attr("class", "rev-by-item-drilldown");
    });
  }
  
  //////////////////////////////////////////////////////////////////////////////////////////
  function plotHistogramWithKDE(dataFilePath, valueColumn) {
    var margin = { top: 90, right: 80, bottom: 40, left: 100 },
      width = 900,
      height = 400;
  
    // d3.select("body").append("br");
  
    var chartSvg = d3
      .select("body")
      .append("svg")
      .attr("class", "histogram-kde")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
  
    d3.csv(dataFilePath).then(function (data) {
      var values = data.map((d) => +d[valueColumn]);
  
      var xDomain = d3.extent(values);
      var x = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
  
      // Create histogram data
      var histogram = d3.histogram().domain(x.domain()).thresholds(x.ticks(30));
      var bins = histogram(values);
  
      // Calculate y-domain for histogram
      var yMax = d3.max(bins, (d) => d.length);
      var y = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);
  
      // Append x-axis
      chartSvg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(x).tickFormat((d) => d / 1e6 + "M"));
  
      // Append y-axis
      chartSvg.append("g").attr("class", "y-axis").call(d3.axisLeft(y).ticks(2));
  
      // Draw histogram bars
      chartSvg
        .selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr(
          "transform",
          (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")"
        )
        .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
        .attr("height", (d) => innerHeight - y(d.length))
        .style("fill", "salmon")
        .style("opacity", 0.5);
  
      // KDE calculation
      var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));
      var density = kde(values);
  
      // Scale density to fit the histogram height
      var scaleFactor = yMax / d3.max(density, (d) => d[1]);
      var scaledDensity = density.map((d) => [d[0], d[1] * scaleFactor]);
  
      // Draw KDE curve
      chartSvg
        .append("path")
        .datum(scaledDensity)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#ff7029")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr(
          "d",
          d3
            .line()
            .curve(d3.curveBasis)
            .x((d) => x(d[0]))
            .y((d) => y(d[1]))
        );
  
      chartSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Phân phối số tiền khách hàng đã chi trả");
    });
  
    // Function to compute density
    function kernelDensityEstimator(kernel, X) {
      return function (V) {
        return X.map(function (x) {
          return [
            x,
            d3.mean(V, function (v) {
              return kernel(x - v);
            }),
          ];
        });
      };
    }
  
    function kernelEpanechnikov(k) {
      return function (v) {
        return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
      };
    }
    // d3.select("body").append("br").attr("class", "histogram-kde");
  }
  
  ///////////////////////////////////////////////////////
  function boxPlotWithPoints(points, id) {
    const new_descriptions = {
      A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
      A2: "Người đi làm tại gia, nội trợ",
      A3: "Mẹ bỉm sữa",
      B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
      B2: "Học sinh, sinh viên",
      B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
      C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
      C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
      C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
    };
  
    var margin = { top: 90, right: 80, bottom: 40, left: 100 },
      width = 800,
      height = 700;
    var innerHeight = height - margin.top - margin.bottom;
    var innerWidth = width - margin.right - margin.left;
  
    // d3.select("body").append("br").attr("class", `${id}`);
  
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", `tooltip-${id}`)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("z-index", "10");
  
    var svg = d3
      .select("body")
      .append("svg")
      .attr("id", id)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg
      .append("text")
      .attr("x", -margin.left + 50)
      .attr("y", -20)
      .attr("text-anchor", "start")
      .text("Phân bổ mức chi tiêu")
      .attr("class", "chart-title");
    d3.csv("data/total_spent.csv").then(function (data) {
      data.map((d) => +d["Thành tiền"]);
  
      var data = Array.from(d3.group(data, (d) => d["Mã PKKH"]));
      xDomain = data.map((d) => d[0]);
  
      var x = d3.scaleBand().range([0, innerWidth]).domain(xDomain).padding(0.1);
  
      svg
        .append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(x));
  
      var allValues = data.flatMap((d) => d[1].map((v) => +v["Thành tiền"]));
      console.log("allvalues", d3.max(allValues));
      var y = d3
        .scaleLinear()
        .domain(d3.extent(allValues))
        .range([innerHeight, 0]);
  
      svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickFormat((d) => d / 1e6 + "M"));
  
      var boxWidth = 50;
  
      data.forEach(function (d) {
        var key = d[0];
        var values = d[1].map((v) => v["Thành tiền"]);
  
        var q1 = d3.quantile(values, 0.25);
        var median = d3.quantile(values, 0.5);
        var q3 = d3.quantile(values, 0.75);
        var interQuantileRange = q3 - q1;
        var min = q1 - 1.5 * interQuantileRange;
        var max = q3 + 1.5 * interQuantileRange;
  
        //Thêm trục dọc chính
        svg
          .append("line")
          .attr("x1", x(key) + x.bandwidth() / 2)
          .attr("x2", x(key) + x.bandwidth() / 2)
          .attr("y1", y(min))
          .attr("y2", y(max))
          .attr("stroke", "black")
          .style("width", 40);
  
        svg
          .append("rect")
          .attr("x", x(key) - boxWidth / 2 + x.bandwidth() / 2)
          .attr("y", y(q3))
          .attr("height", y(q1) - y(q3))
          .attr("width", boxWidth)
          .attr("stroke", "black")
          .style("fill", "#CAE6B2")
          .on("mouseover", function (event, d) {
            tooltip.style(
              "visibility",
              "visible"
            ).html(`${key} - <strong>${new_descriptions[key]}</strong>
                            <br>75% KH có mức chi tiêu dưới ${(q3 / 1e6).toFixed(
                              1
                            )} triệu
                            <br>Trung vị mức chi tiêu: ${(median / 1e6).toFixed(
                              1
                            )} triệu
                            <br>25% KH có mức chi tiêu dưới ${(q1 / 1e6).toFixed(
                              1
                            )} triệu`);
          })
          .on("mousemove", function (event) {
            tooltip
              .style("top", event.pageY - 10 + "px")
              .style("left", event.pageX + 30 + "px");
          })
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
          });
  
        //Thêm đường median
        svg
          .append("line")
          .attr("x1", x(key) - boxWidth / 2 + x.bandwidth() / 2)
          .attr("x2", x(key) + boxWidth / 2 + x.bandwidth() / 2)
          .attr("y1", y(median))
          .attr("y2", y(median))
          .attr("stroke", "#373A40")
          .style("width", 80);
  
        if (points === true) {
          svg
            .selectAll("indPoints")
            .data(values)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
              return (
                x(key) +
                x.bandwidth() / 2 +
                -boxWidth / 2 +
                Math.random() * boxWidth
              );
            }) // Adding jitter
            .attr("cy", function (d) {
              return y(d);
            })
            .attr("r", 3)
            .style("fill", "#FEB941")
            .style("opacity", 0.2)
            .on("mouseover", function (event, d) {
              tooltip.style(
                "visibility",
                "visible"
              ).html(`${key} - <strong>${new_descriptions[key]}</strong>
                            <br>75% KH có mức chi tiêu dưới ${(q3 / 1e6).toFixed(
                              1
                            )} triệu
                            <br>Trung vị mức chi tiêu: ${(median / 1e6).toFixed(
                              1
                            )} triệu
                            <br>25% KH có mức chi tiêu dưới ${(q1 / 1e6).toFixed(
                              1
                            )} triệu`);
            })
            .on("mousemove", function (event) {
              tooltip
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 30 + "px");
            })
            .on("mouseout", function () {
              tooltip.style("visibility", "hidden");
            });
          console.log("x band with/2", x.bandwidth() / 2);
        }
      });
    });
  }
  /////////////////////////
  function violinChart(id) {
    var margin = { top: 90, right: 80, bottom: 40, left: 100 },
      width = 1655,
      height = 400;
    var innerHeight = height - margin.top - margin.bottom;
    var innerWidth = width - margin.right - margin.left;
  
    var svg = d3
      .select("body")
      .append("svg")
      .attr("id", id)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    d3.csv("data/total_spent.csv").then(function (data) {
      data.forEach((d) => (d["Thành tiền"] = +d["Thành tiền"]));
  
      yDomain = d3.extent(data, (d) => d["Thành tiền"]);
      var y = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);
  
      svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickFormat((d) => d / 1e6 + "M"));
  
      console.log(
        "array from new",
        Array.from(new Set(data.map((d) => d["Mã PKKH"])))
      );
  
      var xDomain = Array.from(new Set(data.map((d) => d["Mã PKKH"])));
      var x = d3
        .scaleBand()
        .range([0, innerWidth])
        .domain(xDomain)
        .padding(0.005);
  
      svg
        .append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(x));
  
      function kernelDensityEstimator(kernel, X) {
        return function (V) {
          return X.map(function (x) {
            return [
              x,
              d3.mean(V, function (v) {
                return kernel(x - v);
              }),
            ];
          });
        };
      }
  
      function kernelEpanechnikov(k) {
        return function (v) {
          return Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0;
        };
      }
  
      var kde = kernelDensityEstimator(kernelEpanechnikov(0.2), y.ticks(50));
  
      var groupedData = d3.group(data, (d) => d["Mã PKKH"]);
      var maxDensity = 0;
      var densityData = Array.from(groupedData, ([key, values]) => {
        var density = kde(values.map((v) => v["Thành tiền"]));
        var maxD = d3.max(density, (d) => d[1]);
        if (maxD > maxDensity) maxDensity = maxD;
        return { key: key, density: density };
      });
  
      var xNum = d3
        .scaleLinear()
        .range([0, x.bandwidth()])
        .domain([-maxDensity, maxDensity]);
  
      svg
        .selectAll("myViolin")
        .data(densityData)
        .enter()
        .append("g")
        .attr("transform", (d) => "translate(" + x(d.key) + " ,0)")
        .append("path")
        .datum((d) => d.density)
        .style("stroke", "none")
        .style("fill", "#69b3a2")
        .attr(
          "d",
          d3
            .area()
            .x0((d) => xNum(-d[1]))
            .x1((d) => xNum(d[1]))
            .y((d) => y(d[0]))
            .curve(d3.curveCatmullRom)
        );
      svg
        .append("text")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Biểu đồ violin Phân bổ mức chi tiêu")
        .attr("class", "chart-title");
    });
  }
  
  //////////////////////
  function stackedArea() {
    var margin = { top: 90, right: 80, bottom: 40, left: 100 },
      width = 900,
      height = 700;
  
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
  
    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    d3.csv("data/monthly_segment_rev.csv").then(function (data) {
      data.sort((a, b) => d3.ascending(a["Mã PKKH"], b["Mã PKKH"]));
      const stackedData = d3
        .stack()
        .keys(d3.union(data.map((d) => d["Mã PKKH"]))) // apples, bananas, cherries, …
        .value(([, group], key) => group.get(key)["Thành tiền"])(
        d3.index(
          data,
          (d) => d["Month"],
          (d) => d["Mã PKKH"]
        )
      );
  
      var xDomain = Array.from(new Set(data.map((d) => d["Month"])));
      console.log("xDomain", xDomain);
      var x = d3.scaleBand().domain(xDomain).range([0, innerWidth]).padding(0.1);
      svg
        .append("g")
        .attr(
          "transform",
          "translate(" + (0 - x.bandwidth() / 2) + "," + innerHeight + ")"
        )
        .call(d3.axisBottom(x));
  
      // Add Y axis
      var y = d3
        .scaleLinear()
        .domain([0, d3.max(stackedData, (d) => d3.max(d, (d) => d[1])) * 1.2])
        .range([innerHeight, 0]);
  
      svg.append("g").call(
        d3
          .axisLeft(y)
          .tickFormat((d) => d / 1e9 + "B")
          .tickValues(y.ticks(6).filter((tick) => tick !== 0))
      );
  
      // Color palette
      var color = d3
        .scaleOrdinal()
        .domain(stackedData.map((d) => d.key))
        .range(d3.schemeTableau10);
  
      // Show the areas
      svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", (d) => color(d.key))
        .attr(
          "d",
          d3
            .area()
            .x((_, j) => x(xDomain[j])) // Use xDomain to map index to the respective month
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]))
        );
  
      var sortedKeys = stackedData.map((d) => d.key).sort();
  
      var legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + innerWidth + "," + 0 + ")");
  
      var legendItems = legend
        .selectAll(".legend-item")
        .data(sortedKeys) // Use sorted keys
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");
  
      legendItems
        .append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d) => color(d));
  
      // Append text labels to the legend items
      legendItems
        .append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text((d) => d);
      svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Doanh thu hàng tháng theo phân khúc khách hàng");
    });
  }
  
  ////////////////////////////////////////////////////////////
  function createLollipopPlot() {
    const width = 900;
    const height = 700;
    const margin = { top: 90, right: 80, bottom: 40, left: 250 };
  
    var chartSvg = d3
      .select("body")
      .append("svg")
      .attr("id", "lollipop-chart")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffe3")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("z-index", "10");

    d3.json("data/data.json").then(function (data) {
      const new_descriptions = {
        A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
        A2: "Người đi làm tại gia, nội trợ",
        A3: "Mẹ bỉm sữa",
        B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
        B2: "Học sinh, sinh viên",
        B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
        C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
        C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
        C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
      };
  
      const nestedData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d["Thành tiền"]),
        (d) => d["Mã PKKH"]
      );
  
      let processedData = Array.from(nestedData, ([key, value]) => ({
        key,
        value,
        description: new_descriptions[key] || "No description available",
      }));
  
      processedData.sort((a, b) => d3.ascending(a.key, b.key));
  
      var x = d3
        .scaleLinear()
        .domain([0, d3.max(processedData, (d) => d.value)])
        .range([0, width - margin.left - margin.right]);
  
      var y = d3
        .scaleBand()
        .domain(processedData.map((d) => `${d.key} - ${d.description}`))
        .range([0, height - margin.top - margin.bottom])
        .padding(0.1);
  
      chartSvg
        .append("g")
        .attr("class", "x-axis")
        .attr(
          "transform",
          "translate(0," + (height - margin.top - margin.bottom) + ")"
        );
      chartSvg.append("g").attr("class", "y-axis");
  
      chartSvg
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("class", "y-tick-labels")
        .call(wrap, 200);
  
      function wrap(text, width) {
        text.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            x = text.attr("x"),
            dy = -18,
            lineHeight = 12;
          var tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("dy", dy + "px");
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("dy", ++lineHeight + "pt")
                .text(word);
            }
          }
        });
      }
  
      chartSvg
        .selectAll(".line")
        .data(processedData)
        .enter()
        .append("line")
        .attr("class", "line")
        .attr("x1", x(0))
        .attr("x2", (d) => x(d.value))
        .attr("y1", (d) => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("y2", (d) => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("stroke", "gray");
  
      chartSvg
        .selectAll(".dot")
        .data(processedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => x(d.value))
        .attr("cy", (d) => y(`${d.key} - ${d.description}`) + y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "#102C57")
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `<strong>${d.key}</strong><br>${
                d.description
              }<br>Doanh thu: <strong>${(d.value / 1e6).toFixed(1)} M</strong>`
            );
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
  
      chartSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("Lollipop chart - Doanh thu theo phân khúc khách hàng");
    });
  }
  
  ////////////////////////////////////////////////////////////////
  function pieDonutChart(isDonut = false, chartId) {
    d3.json("data/data.json").then(function (data) {
      const new_descriptions = {
        A1: "Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng",
        A2: "Người đi làm tại gia, nội trợ",
        A3: "Mẹ bỉm sữa",
        B1: "Nhân viên văn phòng, công việc tự do (Chưa kết hôn)",
        B2: "Học sinh, sinh viên",
        B3: "Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn)",
        C1: "CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên",
        C2: "CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý",
        C3: "Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi",
      };
  
      var margin = { top: 90, right: 80, bottom: 40, left: 100 },
        width = 900,
        height = 700;
  
      var radius = 170;
      const color = d3.scaleOrdinal(d3.schemeTableau10);
  
      // Remove existing SVG to prevent overlap
      d3.select(`#${chartId}`).select("svg").remove();
  
      var chartSvg = d3
        .select(`#${chartId}`)
        .append("svg")
        .attr("id", "chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr(
          "transform",
          "translate(" + (width / 2 - margin.right - 150) + "," + height / 2 + ")"
        );
  
      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#ffffe3")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("z-index", "10");
  
      const nestedData = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d["Thành tiền"]),
        (d) => d["Mã PKKH"]
      );
  
      let processedData = Array.from(nestedData, ([key, value]) => ({
        key,
        value,
        description: new_descriptions[key],
      }));
  
      processedData.sort((a, b) => d3.descending(a.value, b.value));
  
      const pie = d3
        .pie()
        .value((d) => d.value)
        .sort(null);
  
      const data_ready = pie(processedData);
  
      chartSvg
        .selectAll("path")
        .data(data_ready)
        .enter()
        .append("path")
        .attr(
          "d",
          d3
            .arc()
            .innerRadius(isDonut ? radius / 2 : 0) // Set innerRadius based on isDonut parameter
            .outerRadius(radius)
        )
        .attr("fill", (d) => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .html(
              `<strong>${d.data.key}</strong><br>${
                d.data.description
              }<br>Doanh thu: <strong>${(d.data.value / 1e6).toFixed(
                1
              )} M</strong>`
            );
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        });
  
      var legend = d3
        .select(`#${chartId} svg`)
        .append("g")
        .attr("class", "legend")
        .attr(
          "transform",
          "translate(" +
            (width - margin.right - margin.left) +
            "," +
            margin.top +
            ")"
        );
  
      var legendItems = legend
        .selectAll(".legend-item")
        .data(processedData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr(
          "transform",
          (d, i) =>
            "translate(" +
            (-margin.right - 200) +
            "," +
            (height / 4 + i * 20) +
            ")"
        );
  
      legendItems
        .append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d) => color(d.key));
  
      legendItems
        .append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text((d) => `${d.key} - ${d.description}`);
  
      chartSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", margin.right)
        .attr("y", -height / 2 + 20 + margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Doanh thu theo phân khúc khách hàng");
    });
  }
  
  ///////////////////////////////////////////////////////////////
  function createScatterPlot(xColumn, yColumn) {
    var margin = { top: 90, right: 80, bottom: 60, left: 100 },
      width = 900,
      height = 350;
  
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
  
    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    d3.csv("data/scatter_data.csv").then((data) => {
      var xScale = d3
        .scaleLinear()
        .domain([
          d3.min(data, (d) => +d[xColumn]),
          d3.max(data, (d) => +d[xColumn]),
        ])
        .range([0, innerWidth]);
  
      var yScale = d3
        .scaleLinear()
        .domain([
          d3.min(data, (d) => +d[yColumn]),
          d3.max(data, (d) => +d[yColumn]),
        ])
        .range([innerHeight, 0]);
  
      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#ffffe3")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("z-index", "10");
  
      svg
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));
  
      svg.append("g").call(d3.axisLeft(yScale));
  
      svg
        .append("text")
        .attr(
          "transform",
          `translate(${innerWidth / 2}, ${innerHeight + margin.bottom / 1.5})`
        )
        .style("text-anchor", "middle")
        .text(xColumn);
  
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 1.5)
        .attr("x", 0 - innerHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yColumn);
  
      svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text(`${xColumn} - ${yColumn}`);
  
      svg
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", (d) => xScale(+d[xColumn]))
        .attr("cy", (d) => yScale(+d[yColumn]))
        .style("fill", "#69b3a2")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible").html(
            `${d["Tên mặt hàng"]}
            <br>${xColumn}: ${d[xColumn]}
            <br>${yColumn}: ${d[yColumn]}`
          );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 40 + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    });
  }
  ////////////////////////////////////////////////////////////////
  function createTable(data) {
    var container = d3
      .select("body")
      .append("div")
      .attr("class", "text-container")
      .style("width", "1200px")
      .style("padding", "10px");
  
    var table = container.append("table").attr("border", "1");
  
    // Append table header
    var thead = table.append("thead");
    var headerRow = thead.append("tr");
    headerRow.append("th").text("Diễn giải");
    headerRow.append("th").text("Dự đoán nguyên do");
    headerRow.append("th").text("Đánh giá & Đề xuất");
  
    // Append table body and rows
    var tbody = table.append("tbody");
  
    // Function to join array elements into paragraphs
    function formatText(textArray) {
      return textArray
        .map(function (sentence) {
          return `<p>${sentence}</p><br>`; // Wrap each sentence in a <p> tag
        })
        .join("");
    }
  
    data.forEach((d) => {
      var row = tbody.append("tr");
      var dienGiai = Array.isArray(d.DienGiai) ? d.DienGiai : [d.DienGiai];
      var duDoan = Array.isArray(d.DuDoan) ? d.DuDoan : [d.DuDoan];
      var danhGia = Array.isArray(d.DanhGia) ? d.DanhGia : [d.DanhGia];
  
      row.append("td").html(formatText(dienGiai));
      row.append("td").html(formatText(duDoan));
      row.append("td").html(formatText(danhGia));
    });
  }
  
  /////////////////////////////////////////////////////////////////////////////
  
  function createTreeMap() {
    var margin = { top: 90, right: 50, bottom: 60, left: 50 },
      width = 900,
      height = 700;
  
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
  
    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    d3.csv("data/rfm.csv").then((data) => {
      data.forEach((d) => {
        d.count_share = +d.count_share;
      });
  
      // Create hierarchy
      var root = d3
        .stratify()
        .id((d) => d.label)
        .parentId((d) => d.parent)(data);
  
      var treemap = d3.treemap().size([innerWidth, innerHeight]);
  
      treemap(root.sum((d) => d.count_share));
  
      var colorScale = d3.scaleOrdinal(d3.schemeDark2);
  
      var tile = svg
        .selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");
  
      tile
        .append("rect")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("fill", (d) => colorScale(d.data.label))
        .style("stroke", "white");
  
      function wrap(text, width) {
        text.each(function () {
          var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            x = text.attr("x"),
            dy = 0,
            lineHeight = 12;
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("dy", dy + "px");
          while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text
                .append("tspan")
                .attr("x", x)
                .attr("dy", ++lineHeight + "pt")
                .text(word);
            }
          }
        });
      }
  
      tile
        .append("text")
        .attr("x", 4)
        .attr("y", 13)
        .text(
          (d) => d.data.label + " - " + Math.round(d.data.count_share * 100) + "%"
        )
        .call(function (text) {
          text.each(function (d) {
            var tileWidth = d.x1 - d.x0;
            wrap(d3.select(this), tileWidth);
            console.log("Wrap Width:", tileWidth);
          });
        })
        .style("fill", "white");
  
      svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -margin.left + 50)
        .attr("y", -20)
        .attr("text-anchor", "start")
        .text("RFM Segmentation");
    });
  }
  
  ///////////////////////////////////////////////
  ///////CALL FUNCTIONS//////////////////////////
  ///////////////////////////////////////////////
  d3.select("body")
    .append("text")
    .attr("class", "heading-1")
    .text("Phân tích các khía cạnh về Thị trường và Hành vi mua của Khách hàng")
    .append("br");
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text("Phân tích Quy mô Thị trường, Khách hàng, Doanh thu")
    .append("br");
  
  createRevByMonthChart("body", "data/data.json");
  
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
            <p>Doanh thu tăng dần từ đầu năm đến cuối năm, có những đoạn trũng vào tháng 2, tháng 6 → 8 so với những tháng xung quanh chúng.</p>
            <p><strong>Tháng 1:</strong> Đầu năm, khách hàng thường đặt mục tiêu về vóc dáng, nên thường tìm đến sản phẩm lành mạnh. Đây là thời điểm thường có khách hàng mới, khi mỗi năm sẽ có thêm những người mới đặt mục tiêu giảm cân đầu năm lần đầu và bắt đầu đầu tư cho mục tiêu này. Tuy nhiên hiệu ứng cũng bị balanced out bởi cận Tết.</p>
            <p><strong>Tháng 2:</strong> Các quyết tâm bắt đầu giảm đi, cũng như đây là dịp chuẩn bị cho Tết và ăn Tết.</p>
            <p><strong>Tháng 3:</strong> Dư âm Tết thường kéo dài đến tháng 3, thế nên doanh thu chưa tăng lại cao. Đồng thời có một số khách hàng đã chuẩn bị "lấy dáng sau Tết". Không chỉ thế, với những khách hàng mới trải nghiệm sản phẩm lần đầu tiên vào đầu năm đến bây giờ đã trải nghiệm Full chất lượng sản phẩm, đã bắt đầu quay lại.</p>
            <p><strong>Tháng 4 - 5:</strong> Chuẩn bị cho summer body.</p>
            <p><strong>Tháng 6:</strong> Học sinh nghỉ học, đây là thời điểm mọi người muốn ăn chơi, nghỉ hè nên không mua các sản phẩm thức ăn, uống giữ sức khỏe, mà muốn tận hưởng xả láng hơn.</p>
            <p><strong>Tháng 7-8:</strong> Mùa hè vẫn còn, nhu cầu giữ dáng cho summer body vẫn còn.</p>
            <p><strong>Tháng 9:</strong> Học sinh vào học lại, mua các sản phẩm tốt cho sức khỏe cho con đi học.</p>
            <p><strong>Tháng 10:</strong> Không có xúc tác nào khiến doanh thu đặc biệt tăng hay giảm.</p>
            <p><strong>Tháng 11-12:</strong> Dịp ôn thi của học sinh, phụ huynh thường muốn đầu tư cho sức khỏe của con. Đồng thời, giai đoạn các bữa tiệc cuối năm, tiệc Giáng sinh nhiều, mọi người có giảm mua các thực phẩm lành mạnh đi đôi chút --> doanh thu trong tháng 12 có giảm nhưng vẫn cao.</p>
            <br>
            <p><strong>Nhìn chung,</strong> pattern tăng cao vào cuối năm có thể có nguồn gốc từ việc thu hút được nhiều khách hàng mới vào đầu năm, và những khách hàng này thường xuyên quay lại và đặt thêm đơn. Trong khoảng thời gian 1 năm, vẫn chưa hết vòng đời khách hàng, thế nên họ chưa rời đi. Trong suốt cả năm cũng có thêm khách hàng mới và họ có quay lại nhiều lần và chưa rời đi trong năm nay. Số lượng khách hàng quay lại và khách hàng mới xuất hiện along the way tích lũy thêm số khách hàng, dẫn đến tích lũy đơn qua từng tháng trong năm, càng về cuối năm, số đơn càng tăng. Đồng thời, có thể doanh nghiệp triển khai thêm nhiều chiến lược marketing thu hút thêm khách hàng trong suots cả năm, thu hút nhiều khách hàng mới hơn, trong khi ở đầu năm lại không tập trung triển khai các chiến lược này do ngại dịp Tết.</p>
        `);
  
  barRevBySeg();
  createLollipopPlot();
  
  d3.select("body").append("div").attr("id", "chartContainer1");
  pieDonutChart(true, "chartContainer1");
  
  d3.select("body").append("div").attr("id", "chartContainer2");
  pieDonutChart(false, "chartContainer2");
  
  stackedArea();
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
            <p>Nhóm khách hàng A1, A2, A3, B2 đóng góp vào đến gần 80% doanh thu của toàn doanh nghiệp. Đây sẽ là nhóm khách hàng mà doanh nghiệp nên dành nhiều sự quan tâm để phục vụ đúng nhu cầu của họ nhằm mang lại doanh thu cho doanh nghiệp.</p>
            <br>
            <p>Đối với nhóm A1 - Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng, đây là nhóm mà thường xuyên ưu tiên triệt để cho sức khỏe, vóc dáng và việc này được duy trì đều đặn, thế nên họ sẽ mua nhiều hơn so với nhiều nhóm khác.</p>
            <br>
            <p>Đối với nhóm C trở đi, có thể không cần đầu tư quá nhiều cho việc phát triển các campaign hay sản phẩm phục vụ nhu cầu của họ.</p>
            `);
  
  createSmallMultiplesChart(
    (data = "data/monthly_segment_rev.csv"),
    (id = "monthly-seg-rev"),
    (chartTitle = "Doanh thu theo tháng của từng Phân khúc khách hàng"),
    (valueColumn = "Thành tiền")
  );
  
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
            <p><strong>A1 - Huấn luyện viên thể hình, giáo viên yoga, nghề liên quan đến vóc dáng:</strong>
            <p>Nhóm này quan tâm nhiều nhất đến sức khỏe, vóc dáng nên có đóng góp lớn vào doanh thu qua các tháng. Pattern theo tháng của nhóm này overshadow những nhóm khác, tạo thành pattern theo tháng chính của toàn bộ khách hàng như ở figure đầu tiên.</p>
            <br>
            <p><strong>A2 - Người đi làm tại gia, nội trợ:</strong>
            <p>Nhóm này khá quan tâm đến ngoại hình, sức khỏe bản thân, tích cực chăm lo cho gia đình. Tháng 1 - cận Tết, nên thấp hơn tương đối so với tháng 12 nếu pattern này được lặp lại qua các năm. Tháng 2, 3 - Tết. Tháng 4, 5 - bounce back, chuẩn bị summer body. Tháng 6, 7, 8 - nghỉ hè, ăn uống không muốn kiêng khem. Tháng 9 trở đi, con vào học, mua tiếp sức đầu năm cho con và quay về nhịp ăn uống giữ gìn thông thường.</p>
            <br>
            <p><strong>A3 - Mẹ bỉm sữa:</strong>
            <p>Nhóm này có nhu cầu lấy lại dáng và bổ sung dinh dưỡng sau khi sinh con, đảm bảo sức khỏe cho con bú, tuy nhiên tài chính chưa đủ mạnh bằng các nhóm khác. Tháng 1 - cận Tết, nên thấp hơn tương đối so với tháng 12 nếu pattern này được lặp lại qua các năm. Tháng 2, 3 - Tết. Tháng 4, 5,6, 7 - bounce back, chuẩn bị summer body. Tháng 8 đi du lịch nghỉ ngơi sẽ rẻ hơn so với mùa du lịch cao điểm đối với nhóm này. Sau khi nghỉ ngơi sẽ tích cực quay lại chăm sóc cho bản thân.</p>
            <br>
            <p><strong>B1 - Nhân viên văn phòng, công việc tự do (Chưa kết hôn):</strong>
            <p>Nhóm này về mặt tài chính có phần thong thả hơn, do không phải nuôi gia đình. Trong độ tuổi chưa nuôi gia đình, người thuộc độ tuổi này thường có mối quan tâm về thể hình và sức khỏe cá nhân và có điều kiện để chi tiêu nhiều hơn. Tháng 1 - cận Tết, nên thấp hơn tương đối so với tháng 12 nếu pattern này được lặp lại qua các năm. Tháng 2, 3 - Tết. Nhóm này không cần phải tranh thủ nghỉ hè vào dịp nghỉ hè của học sinh sinh viên, đồng thời giai đoạn du lịch mùa hè thường vào khoảng tháng 9-10 vì mùa du lịch gần kết thúc, giá sẽ rẻ hơn. Tháng 7-8 (mùa du lịch thông thường), tháng 9-10 có xu hướng giảm nhẹ, có thể vì nhóm này muốn giảm kiêng khem trong chế độ ăn, và tiết kiệm tài chính cho việc du lịch, ăn chơi.</p>
            <br>
            <p><strong>B2 - Học sinh, sinh viên:</strong>
            <p>Tháng 1 - cận Tết, nên thấp hơn tương đối so với tháng 12 nếu pattern này được lặp lại qua các năm. Tháng 2, 3 - Tết. Tháng 7, 8 vì được nghỉ hè, về quê với gia đình, nên thoải mái về tài chính hơn so với cuộc sống tự lập trong năm, nên chi tiêu nhiều hơn cho thực phẩm mình thích.</p>
            <br>
            <p><strong>B3 - Cán bộ, nhân viên, quản lý, công việc tự do (Đã kết hôn):</strong>
            <p>Giống nhóm nội trợ vì nhu cầu chăm lo cho gia đình, chăm lo cho bản thân, tuy nhiên ở nhóm này thì có thể mua thêm vì nhu cầu biếu xén vào tháng 1, 2, ngày 20/11, giáng sinh, ...</p>
            <br>
            <p><strong>C1 - CBCNV nhà nước, quản lý quan tâm sức khỏe tuổi trung niên:</strong>
            <p>Quan tâm thường xuyên sức khỏe nên duy trì trong năm. Có thể vì pattern mua lần đầu vào đầu, giữa năm và thường xuyên mua lại --> tăng dần về cuối năm. Đồng thời về mùa đông, nhiều người tuổi này dễ ốm hơn, họ lại càng quan tâm đến sức khỏe và chi tiêu nhiều hơn.</p>
            <br>
            <p><strong>C2 - CBCNV nhà nước, quản lý quan tâm sản phẩm cho bệnh lý:</strong>
            <p>Giống C1.</p>
            <br>
            <p><strong>C3 - Trưởng phòng, quản lý, cấp cao mua làm quà tặng, biếu gửi:</strong>
            <p>Các dịp biếu nhiều: Tháng 1,2 - Tết, tháng 9 biếu giáo viên, tháng 10 có 20/10, tháng 11 có 20/11, tháng 12 quà cuối năm, giáng sinh.</p>
          `);
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text(
      "Phân tích Hành vi mua lặp lại và Hành vi mua mới của từng phân khúc khách hàng"
    )
    .append("br");
  
  createSmallMultiplesChart(
    (data = "data/monthly_churning_rate.csv"),
    (id = "monthly-churn"),
    (chartTitle = "Tỉ lệ rời bỏ hàng tháng"),
    (valueColumn = "churning rate")
  );
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text("Phân tích Hành vi mua theo mức chi tiêu")
    .append("br");
  
  plotHistogramWithKDE("data/total_spent.csv", "Thành tiền");
  d3.select("body").append("br");
  
  boxPlotWithPoints((points = false), (id = "group-boxplot-points"));
  boxPlotWithPoints((points = true), (id = "group-boxplot"));
  violinChart("violinPlot1");
  
  d3.select("body").append("br");
  
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
        <p><strong>Diễn giải</strong></p>
          <p>Doanh nghiệp này đang hướng đến các phân khúc khách hàng có thu nhập và khả năng chi tiêu cao, thể hiện qua giá trị đơn hàng trung bình cao.</p>
          <p>Nhóm A1 (Huấn luyện viên, giáo viên yoga) có giá trị đơn hàng trung bình cao nhất, lên tới 962,751 đồng.</p>
          <p>Các nhóm khách hàng khác như A2, A3, B1, C1 cũng có giá trị đơn hàng tương đối cao, từ 400,000 đến 800,000 đồng.</p>
  
        <br>
        <p><strong>Dự đoán nguyên do</strong></p>
          <pMua nhiều sản phẩm trên đơn (đã chứng minh ở trên) làm cho giá trị mỗi đơn hàng cao.</p>
          <p>Các phân khúc khách hàng này có thu nhập ổn định, quan tâm đến sức khỏe và đời sống chất lượng.</p>
          <p>Họ sẵn sàng chi trả nhiều hơn cho các sản phẩm, dịch vụ phục vụ nhu cầu của bản thân và gia đình.</p>
          <p>Doanh nghiệp có thể đang tập trung tiếp thị, định vị sản phẩm phù hợp với phân khúc khách hàng này.</p>
  
        <br>  
        <p><strong>Đánh giá & Đề xuất</strong></p>
          <p>Doanh nghiệp đang đúng hướng khi hướng đến các phân khúc khách hàng có thu nhập cao, khả năng chi tiêu mạnh.</p>
          <p>Đối với những người chi tiêu mạnh tay, họ quan tâm đến chất lượng sản phẩm, sự khác biệt, độc đáo và tính cá nhân hóa trong sản phẩm → doanh nghiệp có thể phát triển sản phẩm theo PK chất lượng cao trong tương lai.</p>
          <p>Có thể gợi ý bán chéo mà không lo ngại về khả năng tài chính của khách hàng, nên tập trung vào phát triển chiến lược bán chéo hiệu quả, bán chéo với các sản phẩm mang lại biên lợi cao.</p>
        `);
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text("Phân nhóm khách hàng theo phương pháp RFM")
    .append("br");
  
  createTreeMap();
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
      <p><strong>Nhóm "hibernating" (ngủ đông)</strong> là nhóm lớn nhất trong biểu đồ, cho thấy đây là nhóm khách hàng có số lượng đáng kể. Nhóm này bao gồm những khách hàng đã từng giao dịch với công ty nhưng đã không có hoạt động mua hàng trong một khoảng thời gian dài. Điều này có thể là do nhiều lý do khác nhau, chẳng hạn như mất đi nhu cầu sản phẩm/dịch vụ, chuyển sang sử dụng sản phẩm của đối thủ cạnh tranh hoặc đơn giản là quên mất doang nghiệp. Để tái kích hoạt nhóm khách hàng này, công ty có thể triển khai các chiến dịch tiếp thị nhắc nhở, cung cấp ưu đãi đặc biệt hoặc liên hệ trực tiếp để hiểu rõ hơn về nhu cầu và mong muốn của họ.</p>
      <br>
  
      <p><strong>Nhóm "potential loyalist" (tiềm năng trung thành)</strong> cũng là một nhóm lớn, bao gồm những khách hàng có triển vọng trở thành khách hàng trung thành nếu được chăm sóc và duy trì đúng cách. Đây là những khách hàng đã có một số giao dịch với công ty và có tiềm năng sẽ tiếp tục mua hàng trong tương lai. Để biến họ thành khách hàng trung thành, công ty có thể cung cấp chương trình khách hàng thân thiết, ưu đãi đặc biệt, dịch vụ chăm sóc khách hàng xuất sắc và tương tác thường xuyên để xây dựng mối quan hệ lâu dài.</p>
      <br>
  
      <p><strong>Nhóm "at risk" (có nguy cơ)</strong> cũng chiếm một phần lớn trong biểu đồ. Đây là những khách hàng có khả năng sẽ ngừng mua hàng hoặc chuyển sang sử dụng sản phẩm của đối thủ cạnh tranh. Để giữ chân họ, công ty cần nhanh chóng can thiệp bằng cách cung cấp ưu đãi hấp dẫn, cải thiện trải nghiệm khách hàng, giải quyết bất kỳ vấn đề hoặc khiếu nại nào từ phía khách hàng và tăng cường tương tác với họ.</p>
      <br>
  
      <p><strong>Nhóm "loyal customers" (khách hàng trung thành) và "champions" (người ủng hộ)</strong> có quy mô tương đối nhỏ trong biểu đồ. Tuy nhiên, đây là những nhóm khách hàng quan trọng nhất đối với công ty. Khách hàng trung thành thường đóng góp một phần lớn doanh thu và lợi nhuận cho doanh nghiệp, đồng thời cũng là những người tiếp thị và giới thiệu sản phẩm/dịch vụ của công ty với người khác. Công ty nên đầu tư vào việc duy trì mối quan hệ tốt với họ thông qua các chương trình khách hàng thân thiết, ưu đãi đặc biệt, sự quan tâm cá nhân và trải nghiệm khách hàng tuyệt vời.</p>
      <br>
  
      <p><strong>Các nhóm khách hàng khác như "about to sleep" (sắp ngủ), "needing attention" (cần quan tâm), "promising" (đầy hứa hẹn) và "can't lose them" (không thể mất họ)</strong> cũng đòi hỏi những chiến lược và hành động khác nhau từ phía công ty. Nhóm "about to sleep" bao gồm những khách hàng đã giảm hoạt động mua hàng gần đây và có nguy cơ trở thành nhóm "hibernating" nếu không được chăm sóc đúng cách. Công ty cần nhanh chóng can thiệp với các chiến dịch tiếp thị nhắc nhở và ưu đãi hấp dẫn để kích hoạt lại hoạt động mua hàng của họ.</p>
      <br>
  
      <p><strong>Nhóm "needing attention"</strong> cũng cần được chăm sóc đặc biệt để đảm bảo rằng họ không chuyển sang sử dụng sản phẩm của đối thủ cạnh tranh. Công ty có thể cải thiện trải nghiệm khách hàng, cung cấp dịch vụ chăm sóc khách hàng tốt hơn, giải quyết nhanh chóng bất kỳ vấn đề hoặc khiếu nại nào từ phía họ và cung cấp các ưu đãi hấp dẫn để giữ chân họ.</p>
      <br>
  
      <p><strong>Đối với nhóm "promising" (đầy hứa hẹn),</strong> đây là những khách hàng mới hoặc gần đây mới bắt đầu giao dịch với công ty. Để phát triển họ thành khách hàng trung thành, công ty cần đầu tư vào việc xây dựng mối quan hệ bền vững, cung cấp trải nghiệm khách hàng tuyệt vời và đáp ứng nhu cầu của họ một cách hiệu quả.</p>
      <br>
  
      <p>Cuối cùng, <strong>nhóm "can't lose them" (không thể mất họ)</strong> bao gồm những khách hàng quan trọng nhất, có giá trị cao nhất đối với doanh nghiệp. Công ty cần dành sự quan tâm đặc biệt cho nhóm này thông qua dịch vụ chăm sóc khách hàng cá nhân hóa, ưu đãi đặc biệt và tương tác thường xuyên để đảm bảo rằng họ cảm thấy được trân trọng và gắn bó với công ty.</p>
      `);
  
  d3.select("body").append("br");
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text("Phân tích Hành vi mua theo thời gian")
    .append("br");
  
  timeBarGrid();
  
  var timeInsight = [
    {
      DienGiai: "Số đơn càng về cuối tuần càng nhiều.",
      DuDoan: [
        "Thứ 7, CN có thời gian rảnh mua sắm.",
        "Tuy nhiên mức chênh lệch không lớn so với những ngày khác do mua sắm online thuận tiện, ngày nào cũng có thể mua.",
      ],
      DanhGia: [
        "Nếu có triển khai chương trình khuyến mãi gì, có thể làm vào T7, CN.",
        "Tối ưu hóa quảng cáo bằng cách cho chạy vào những ngày cuối tuần.",
        "Có thể nới rộng thêm thời gian mở cửa vào các ngày này.",
        "Assign thêm nhân viên vào các ngày này (part time).",
        "Nhưng chính vì không chênh lệch nhiều về SL đơn hàng, có thể không cần có ưu tiên lớn, ví dụ như chỉ mở thêm 30p - 1 tiếng thời gian mở cửa hoặc assign thêm 1-2 part time vào những ngày này.",
      ],
    },
    {
      DienGiai: "Số đơn cao vào 21 giờ, 22 giờ, 20 giờ, 12 giờ, 18 giờ, 15 giờ.",
      DuDoan: "Các khung giờ nghỉ trưa, tan tầm, ăn tối nghỉ ngơi.",
      DanhGia: [
        "Chạy quảng cáo vào những giờ cao điểm, 6 khung giờ nên chạy quảng cáo: 21 giờ, 22 giờ, 20 giờ, 12 giờ, 18 giờ, 15 giờ.",
        "Assign đủ nhân viên vào những giờ cao điểm.",
      ],
    },
    {
      DienGiai: [
        "Đàu tháng có nhỉnh nhẹ về số lượng đơn hàng, có thể do đa số mọi người mới nhận lương. Giảm nhẹ về cuối tháng. Ngày 31 thấp vì không phải tháng nào cũng có ngày 31.",
        "Tuy nhiên chênh lệch về số đơn giữa các ngày không nhiều.",
      ],
      DuDoan: "Do việc nhận lương ảnh hưởng đến hành vi mua hàng.",
      DanhGia: [
        "Có thể giúp doanh nghiệp lên kế hoạch nhập hàng phù hợp, tránh nhập thiếu hoặc tồn kho dư thừa.",
        "Tuy nhiên, vì không chênh lệch số lượng đơn hàng mỗi ngày lớn, thế nên chưa thất thiết phải phân nhiều nhân viên hơn vào những ngày đầu tháng.",
        "Chạy quảng cáo vào các ngày đầu tháng.",
      ],
    },
  ];
  createTable(timeInsight);
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-1")
    .text("Phân tích các khía cạnh về Hàng Hóa")
    .append("br");
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text(
      "Phân tích chiến lược hàng hóa thông qua doanh thu - đơn giá - số lượng bán - lợi nhuận"
    )
    .append("br");
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
        `);
  
  createScatterPlot("Rank tiền lời", "Rank mức SL bán");
  createScatterPlot("Rank tổng lợi nhuận", "Rank mức SL bán");
  createScatterPlot("Rank mức rẻ", "Rank mức doanh thu");
  createParallelPlot("Rank TL lời", "Rank tổng lợi nhuận", "Rank mức doanh thu");
  var data = [
    {
      Ten: "Granola",
      DienGiai: [
        "Đơn giá 150k, rank 17/32 về rẻ.",
        "Biên lời thấp, 10%, hạng 23/32 về biên lời.",
        "Số tiền lời kiếm được cho mỗi sản phẩm cũng không cao, đứng hạng 25/30.",
        "Đứng nhất về doanh thu, số lượng bán ra và tổng lợi nhuận.",
        "Granola là nhóm hàng có doanh thu lớn nhất và nổi bật nhất.",
        "Đơn giá của Granola là tương đối thấp so với những mặt hàng khác (đứng hạng 17 trong số 32 sản phẩm về đơn giá), nhưng chính vì số lượng bán ra cao dẫn đầu, nên mang về doanh thu lớn.",
        "Về mặt tỉ lệ lợi nhuận, granola cũng không cao (rank 23/32). Tuy nhiên, tổng lợi nhuận mang về lại lớn nhất, là nhờ số lượng bán ra là lớn nhất.",
      ],
      DuDoan: [""],
      DanhGia: [""],
    },
    {
      Ten: "Bánh Biscotti",
      DienGiai: [
        "Đơn giá 130k (rank 13 về rẻ, cũng ngang với granola là 17).",
        "Tỉ lệ lợi nhuận cao, 19%, rank 12.",
        "Rank doanh thu và tổng số lượng bán được là 6/32, khá cao so với những sản phẩm khác. Với số lượng bán đó cũng được xem là bán khá chạy.",
        "Rank lợi nhuận đứng hạng 2.",
        "Rank số tiền lời kiếm được khi bán 1 sản phẩm là hạng 8 (khá cao).",
      ],
      DuDoan: [
        "Có thể là món ăn vặt đắt tiền, phục vụ phân khúc khách hàng có thu nhập cao, sẵn sàng chi trả nhiều hơn cho chất lượng.",
        "Là sản phẩm đặc biệt, không phải nhu cầu hằng ngày nên số lượng bán ra không quá cao.",
      ],
      DanhGia: [
        "Đây là mặt hàng không bán được chạy nhất nhưng lại mang lại lượng lợi nhuận cao. Không chỉ có tỉ lệ lợi nhuận cao, mà mà lượng lợi nhuận trên mỗi sản phẩm cũng cao. Sản phẩm cũng khá dễ bán.",
        "Nên tận dụng để bán chéo, recommend cho khách mua để tăng lợi nhuận về cho doanh nghiệp.",
      ],
    },
    {
      Ten: "Bún gạo lứt",
      DienGiai: [
        "Đơn giá 50k, đứng thứ 3 về độ rẻ.",
        "Tỉ lệ lợi nhuận lại rất cao, đứng nhất, với 34% lợi.",
        "Tuy nhiên vì đơn giá thấp nên số tiền lời trên mỗi sản phẩm lại không cao.",
        "Bán được số lượng lớn, rank 3 về số lượng bán được.",
        "Doanh thu không cao (rank 20) do bán được số lượng nhiều nhưng đơn giá thấp.",
        "Bù lại, mức tổng lợi nhuận đem về lại cao, đứng rank 3.",
      ],
      DuDoan: [
        "Món ăn cơ bản, tiêu thụ đại trà nên giá rẻ để phù hợp với nhiều đối tượng khách hàng.",
        "Sản phẩm thiết yếu, nhu cầu cao.",
      ],
      DanhGia: [
        "Đây là mặt hàng giá rẻ, dễ bán, và tỉ lệ biên lợi cao. Dễ đề xuất cho nhiều đối tượng khác hàng khác nhau.",
        "Có thể đề xuất khách hàng mua nhiều để tăng tổng lượng lợi nhuận.",
      ],
    },
    {
      Ten: "Bún ngũ sắc",
      DienGiai: [
        "Không phải là quá rẻ, 95k, rank 10/32 về mức rẻ",
        "Tỉ lệ lợi nhuận ngang với granola là 16%",
        "Số tiền lời thu về trên mỗi sản phẩm cũng không nổi bật. So với bún gạo lứt, thua một rank. ",
        "Số lượng bán ra lại cao hơn so với bún gạo lứt một bậc, doanh thu cao hơn (13 so với 20), nhưng tổng lợi nhuận cũng lại thua 1 bậc so với bún gạo lứt",
      ],
      DuDoan: ["Mặt hàng staple, giá không cao, dễ bán."],
      DanhGia: [
        "Giữa bún ngũ sắc và bún gạo lứt để recommend cho khác hàng, recommend 1 bún ngũ sắc sẽ được nhiều tiền hơn so với 1 bún gạo lứt, dù cho đơn giá của bún ngũ sắc cao gần gấp đôi.",
        "Đây là một mặt hàng bán chạy, lợi nhuận ổn, cố gắng duy trì performance.",
      ],
    },
  ];
  
  // Select the container and append a table element
  var container = d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px");
  
  var table = container.append("table").attr("border", "1");
  
  // Append table header
  var thead = table.append("thead");
  var headerRow = thead.append("tr");
  headerRow.append("th").text("Tên");
  headerRow.append("th").text("Diễn giải");
  headerRow.append("th").text("Dự đoán nguyên do");
  headerRow.append("th").text("Đánh giá & Đề xuất");
  
  // Append table body and rows
  var tbody = table.append("tbody");
  
  // Function to join array elements into paragraphs
  function formatText(textArray) {
    return textArray
      .map(function (sentence) {
        return `<p>${sentence}</p><br>`; // Wrap each sentence in a <p> tag for better separation
      })
      .join("");
  }
  
  data.forEach((d) => {
    var row = tbody.append("tr");
    row.append("td").text(d.Ten);
    row.append("td").html(formatText(d.DienGiai));
    row.append("td").html(formatText(d.DuDoan));
    row.append("td").html(formatText(d.DanhGia));
  });
  
  d3.select("body").append("br");
  
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text("Hành vi mua theo Nhóm hàng")
    .append("br");
  
  changeDataPlot();
  drillDownChart();
  
  d3.select("body").append("br");
  
  createWordCloud();
  
  d3
    .select("body")
    .append("div")
    .attr("class", "text-container")
    .style("width", "1200px")
    .style("padding", "10px").html(`
        Granola là mặt hàng chủ đạo của cửa hàng, chiếm đến 14% doanh thu --> nên ưu tiên tập trung giữ và phát triển sản phẩm này. Đặc biệt, cần đào sâu vào phân tích lí do tại sao mặt hàng này lại nổi trong khách hàng để có thể phát triển những sản phẩm tương tự.
        
        <br>
        <strong>Một số lí giải về sự phổ biến của Granola:</strong>
        <ul>
          <li>Giá trị dinh dưỡng cao: Granola thường chứa nhiều ngũ cốc nguyên hạt, hạt, và các thành phần dinh dưỡng như protein, chất xơ, vitamin và khoáng chất, đáp ứng nhu cầu về sức khỏe và dinh dưỡng của người tiêu dùng.</li>
          <li>Tính tiện lợi và linh hoạt: Có thể được dùng như bữa sáng hoặc snacks. Granola có thể được ăn trực tiếp, trộn với sữa, yaourt, hoặc kết hợp với các món ăn khác, tạo ra nhiều cách thức sử dụng khác nhau.</li>
          <li>Hương vị đa dạng: Granola có thể được sản xuất với nhiều hương vị và kết hợp khác nhau như chocolate, trái cây, hạt, mật ong, v.v. đáp ứng các sở thích khác nhau của người tiêu dùng.</li>
          <li>Truyền thông và tiếp thị hiệu quả</li>
          <li>Nguồn cung đều đặn quanh năm</li>
        </ul>
        
        <br>
        <strong>Các mặt hàng sữa cũng có doanh thu cao  và nằm trong tệp Pareto 0.6, có thể có một số lí giải:</strong>
        <ul>
          <li>Đơn giá cao, có thể không bán được nhiều nhưng doanh thu nhân lại thì cao.</li>
          <li>Các khách hàng là người lớn tuổi, quan tâm đến sức khỏe bản thân, mà nhóm này thường xuyên có xu hướng "mua sữa uống cho bổ"</li>
          <li>Nguồn cung đều đặn quanh năm</li>
          <li>Các hãng sữa mà cửa hàng chọn bán lớn và đáng tin cậy</li>
        </ul>
        <br>
        <strong>Lí giải sự kém phổ biến của các mặt hàng thuộc nhóm 0.1</strong>
        <ul>
          <li>Có các mặt hàng có thời gian hết hạn nhanh hơn</li>
          <li>Thị trường còn xa lạ với các mặt hàng này, hương vị hay công dụng chưa được phổ biến rộng rãi</li>
          <li>Nguồn cung ít hơn, khó sản xuất hơn</li>
          <li>Không đáp ứng được nhu cầu chính mà các khách hàng quan tâm</li>
        </ul>
  
        <br>
        Có những nhóm hàng mang lại doanh thu cao như hạt dinh dưỡng và sữa organic. Nên tiếp tục duy trì để giữ doanh thu và traffic cho doanh nghiệp. Tìm hiểu nguyên nhân phổ biến cho sự phổ biến của từng loại và biên lợi nhuận. Có thể giữ những nhóm này ở mức biên lợi nhuận thấp trong khi một số nhóm sẽ chịu trách nhiệm cho lợi nhuận.
        Không ngoài dự đoán, nhóm hàng hạt dinh dưỡng (nhóm hàng của granola) và nhóm hàng sữa có doanh thu dẫn đầu.
      </ul>
    `);
  
  d3.select("body").append("br");
  d3.select("body")
    .append("text")
    .attr("class", "heading-2")
    .text("Hành vi mua theo Mặt hàng")
    .append("br");
  createHeatMap();
  d3.select("body").append("br");
