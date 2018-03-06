// (function() {

var svg;

// Save off default references
// var d3 = window.d3, topojson = window.topojson;

import * as d3 from 'd3';

import * as $ from 'jquery';

var topojson = require('ts-topojson');



import { worldTopo} from './worldTopo';



/*
 Getter for value. If not declared on datumValue, look up the chain into optionsValue
 */
function val(datumValue, optionsValue, context?) {
    if (typeof context === 'undefined') {
        context = optionsValue;
        optionsValue = undefined;
    }
    var value = typeof datumValue !== 'undefined' ? datumValue : optionsValue;

    if (typeof value === 'undefined') {
        return null;
    }

    if (typeof value === 'function') {
        var fnContext = [context];
        if (context.geography) {
            fnContext = [context.geography, context.data];
        }
        return value.apply(null, fnContext);
    }
    else {
        return value;
    }
}

function addContainer(element, height, width) {
    this.svg = d3.select(element).append('svg')
        .attr('width', width || element.offsetWidth)
        .attr('data-width', width || element.offsetWidth)
        .attr('class', 'datamap')
        .attr('height', height || element.offsetHeight)
        .style('overflow', 'hidden'); // IE10+ doesn't respect height/width when map is zoomed in

    if (this.options.responsive) {
        d3.select(this.options.element).style({
            'position': 'relative',
            'padding-bottom': (this.options.aspectRatio * 100) + '%'
        });
        d3.select(this.options.element).select('svg').style({
            'position': 'absolute',
            'width': '100%',
            'height': '100%'
        });
        d3.select(this.options.element).select('svg').select('g').selectAll('path').style('vector-effect', 'non-scaling-stroke');

    }

    return this.svg;
}

// setProjection takes the svg element and options
function setProjection(element, options) {
    var width = options.width || element.offsetWidth;
    var height = options.height || element.offsetHeight;
    var projection, path;
    var svg = this.svg;

    if (options && typeof options.scope === 'undefined') {
        options.scope = 'world';
    }

    if (options.scope === 'usa') {
        projection = d3.geo.albersUsa()
            .scale(width)
            .translate([width / 2, height / 2]);
    }
    else if (options.scope === 'world') {
        projection = d3.geo[options.projection]()
            .scale((width + 1) / 2 / Math.PI)
            .translate([width / 2, height / (options.projection === "mercator" ? 1.45 : 1.8)]);
    }

    if (options.projection === 'orthographic') {

        svg.append("defs").append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", path);

        svg.append("use")
            .attr("class", "stroke")
            .attr("xlink:href", "#sphere");

        svg.append("use")
            .attr("class", "fill")
            .attr("xlink:href", "#sphere");
        projection.scale(250).clipAngle(90).rotate(options.projectionConfig.rotation)
    }

    path = d3.geo.path()
        .projection(projection);

    return {path: path, projection: projection};
}

function addStyleBlock() {
    if (d3.select('.datamaps-style-block').empty()) {
        d3.select('head').append('style').attr('class', 'datamaps-style-block')
            .html('.datamap path.datamaps-graticule ' +
                '{ fill: none; stroke: #777; stroke-width: 0.5px; stroke-opacity: .5; pointer-events: none; }' +
                ' .datamap .labels {pointer-events: none;} .datamap path:not(.datamaps-arc), .datamap circle,' +
                ' .datamap line {stroke: #FFFFFF; vector-effect: non-scaling-stroke; stroke-width: 1px;}' +
                ' .datamaps-legend dt, .datamaps-legend dd { float: left; margin: 0 3px 0 0;} ' +
                '.datamaps-legend dd {width: 20px; margin-right: 6px; border-radius: 3px;} ' +
                '.datamaps-legend {padding-bottom: 20px; z-index: 1001; ' +
                'position: absolute; left: 4px; font-size: 12px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;}' +
                ' .datamaps-hoverover {display: none; } ' +
                '.hoverinfo { width:300px; padding: 2px; border-radius: 1px; background-color: #FFF; color:#000;' +
                ' font-size: 12px; border: 1px solid #CCC; }' +
                ' .hoverinfo hr {border:1px dotted #CCC; }');
    }
}

function drawSubunits(data) {
    var fillData = this.options.fills,
        colorCodeData = this.options.data || {},
        geoConfig = this.options.geographyConfig;

    var subunits = this.svg.select('g.datamaps-subunits');
    if (subunits.empty()) {
        subunits = this.addLayer('datamaps-subunits', null, true);
    }

    var geoData = topojson.feature(data, data.objects[this.options.scope]).features;
    if (geoConfig.hideAntarctica) {
        geoData = geoData.filter(function (feature) {
            return feature.id !== "ATA";
        });
    }

    if (geoConfig.hideHawaiiAndAlaska) {
        geoData = geoData.filter(function (feature) {
            return feature.id !== "HI" && feature.id !== 'AK';
        });
    }

    var geo = subunits.selectAll('path.datamaps-subunit').data(geoData);

    geo.enter()
        .append('path')
        .attr('d', this.path)
        .attr('class', function (d) {
            return 'datamaps-subunit ' + d.id;
        })
        .attr('data-info', function (d) {
            return JSON.stringify(colorCodeData[d.id]);
        })
        .style('fill', function (d) {
            // If fillKey - use that
            // Otherwise check 'fill'
            // Otherwise check 'defaultFill'
            var fillColor;

            var datum = colorCodeData[d.id];
            if (datum && datum.fillKey) {

                fillColor = fillData[val(datum.fillKey,
                    {data: colorCodeData[d.id], geography: d})];
            }

            if (typeof fillColor === 'undefined') {
                fillColor = val(datum && datum.fillColor, fillData.defaultFill, {
                    data: colorCodeData[d.id],
                    geography: d
                });
            }

            return fillColor;
        })
        .style('stroke-width', geoConfig.borderWidth)
        .style('stroke-opacity', geoConfig.borderOpacity)
        .style('stroke', geoConfig.borderColor);
}

function handleGeographyConfig() {
    var hoverover;
    var svg = this.svg;
    var self = this;
    var options = this.options.geographyConfig;

    if (options.highlightOnHover || options.popupOnHover) {
        svg.selectAll('.datamaps-subunit')
            .on('mouseover', function (d) {
                var $this = d3.select(this);
                var datum = self.options.data[d.id] || {};
                if (options.highlightOnHover) {
                    var previousAttributes = {
                        'fill': $this.style('fill'),
                        'stroke': $this.style('stroke'),
                        'stroke-width': $this.style('stroke-width'),
                        'fill-opacity': $this.style('fill-opacity')
                    };

                    $this
                        .style('fill', val(datum.highlightFillColor, options.highlightFillColor, datum))
                        .style('stroke', val(datum.highlightBorderColor, options.highlightBorderColor, datum))
                        .style('stroke-width', val(datum.highlightBorderWidth, options.highlightBorderWidth, datum))
                        .style('stroke-opacity', val(datum.highlightBorderOpacity, options.highlightBorderOpacity, datum))
                        .style('fill-opacity', val(datum.highlightFillOpacity, options.highlightFillOpacity, datum))
                        .attr('data-previousAttributes', JSON.stringify(previousAttributes));

                    // As per discussion on https://github.com/markmarkoh/datamaps/issues/19
                    if (!/((MSIE)|(Trident))/.test(navigator.userAgent)) {
                        moveToFront.call(this);
                    }
                }

                if (options.popupOnHover) {
                    self.updatePopup($this, d, options, svg);
                }
            })
            .on('mouseout', function () {
                var $this = d3.select(this);

                if (options.highlightOnHover) {
                    // Reapply previous attributes
                    var previousAttributes = JSON.parse($this.attr('data-previousAttributes'));
                    for (var attr in previousAttributes) {
                        $this.style(attr, previousAttributes[attr]);
                    }
                }
                $this.on('mousemove', null);
                d3.selectAll('.datamaps-hoverover').style('display', 'none');
            });
    }

    function moveToFront() {
        this.parentNode.appendChild(this);
    }
}

// Plugin to add a simple map legend
function addLegend(layer, data, options) {
    data = data || {};
    if (!this.options.fills) {
        return;
    }

    var html = '<dl>';
    var label = '';
    if (data.legendTitle) {
        html = '<h2>' + data.legendTitle + '</h2>' + html;
    }
    for (var fillKey in this.options.fills) {

        if (fillKey === 'defaultFill') {
            if (!data.defaultFillName) {
                continue;
            }
            label = data.defaultFillName;
        } else {
            if (data.labels && data.labels[fillKey]) {
                label = data.labels[fillKey];
            } else {
                label = fillKey + ': ';
            }
        }
        html += '<dt>' + label + '</dt>';
        html += '<dd style="background-color:' + this.options.fills[fillKey] + '">&nbsp;</dd>';
    }
    html += '</dl>';

    var hoverover = d3.select(this.options.element).append('div')
        .attr('class', 'datamaps-legend')
        .html(html);
}

function addGraticule(layer, options) {
    var graticule = d3.geo.graticule();
    this.svg.insert("path", '.datamaps-subunits')
        .datum(graticule)
        .attr("class", "datamaps-graticule")
        .attr("d", this.path);
}

function handleArcs(layer, data, options) {
    var self = this,
        svg = this.svg;

    if (!data || (data && !data.slice)) {
        throw "Datamaps Error - arcs must be an array";
    }

    // For some reason arc options were put in an `options` object instead of the parent arc
    // I don't like this, so to match bubbles and other plugins I'm moving it
    // This is to keep backwards compatability
    for (var i = 0; i < data.length; i++) {
        data[i] = defaults(data[i], data[i].options);
        delete data[i].options;
    }

    if (typeof options === "undefined") {
        options = Datamap.defaultOptions.arcConfig;
    }

    var arcs = layer.selectAll('path.datamaps-arc').data(data, JSON.stringify);

    var path = d3.geo.path()
        .projection(self.projection);

    arcs
        .enter()
        .append('svg:path')
        .attr('class', 'datamaps-arc')
        .style('stroke-linecap', 'round')
        .style('stroke', function (datum) {
            return val(datum.strokeColor, options.strokeColor, datum);
        })
        .style('fill', 'none')
        .style('stroke-width', function (datum) {
            return val(datum.strokeWidth, options.strokeWidth, datum);
        })
        .attr('d', function (datum) {

            var originXY, destXY;

            if (typeof datum.origin === "string") {
                originXY = self.path.centroid(svg.select('path.' + datum.origin).data()[0])
            } else {
                originXY = self.latLngToXY(val(datum.origin.latitude, datum), val(datum.origin.longitude, datum))
            }

            if (typeof datum.destination === 'string') {
                destXY = self.path.centroid(svg.select('path.' + datum.destination).data()[0])
            } else {
                destXY = self.latLngToXY(val(datum.destination.latitude, datum), val(datum.destination.longitude, datum));
            }
            var midXY = [(originXY[0] + destXY[0]) / 2, (originXY[1] + destXY[1]) / 2];
            if (options.greatArc) {
                // TODO: Move this to inside `if` clause when setting attr `d`
                var greatArc = (<any>(d3.geo)).greatArc()
                    .source(function (d) {
                        return [val(d.origin.longitude, d), val(d.origin.latitude, d)];
                    })
                    .target(function (d) {
                        return [val(d.destination.longitude, d), val(d.destination.latitude, d)];
                    });

                return path(greatArc(datum))
            }
            var sharpness = val(datum.arcSharpness, options.arcSharpness, datum);
            return "M" + originXY[0] + ',' + originXY[1] + "S" + (midXY[0] + (50 * sharpness)) + "," + (midXY[1] - (75 * sharpness)) + "," + destXY[0] + "," + destXY[1];
        })
        .attr('data-info', function (datum) {
            return JSON.stringify(datum);
        })
        .on('mouseover', function (datum) {
            var $this = d3.select(this);

            if (options.popupOnHover) {
                self.updatePopup($this, datum, options, svg);
            }
        })
        .on('mouseout', function (datum) {
            var $this = d3.select(this);

            d3.selectAll('.datamaps-hoverover').style('display', 'none');
        })
        .transition()
        .delay(100)
        .style('fill', function (datum) {
            /*
             Thank you Jake Archibald, this is awesome.
             Source: http://jakearchibald.com/2013/animated-line-drawing-svg/
             */
            var length = this.getTotalLength();
            this.style.transition = this.style.WebkitTransition = 'none';
            this.style.strokeDasharray = length + ' ' + length;
            this.style.strokeDashoffset = length;
            this.getBoundingClientRect();
            this.style.transition = this.style.WebkitTransition = 'stroke-dashoffset ' + val(datum.animationSpeed, options.animationSpeed, datum) + 'ms ease-out';
            this.style.strokeDashoffset = '0';
            return 'none';
        })

    arcs.exit()
        .transition()
        .style('opacity', 0)
        .remove();
}

function handleLabels(layer, options) {
    var self = this;
    options = options || {};
    var labelStartCoodinates = this.projection([-67.707617, 42.722131]);
    this.svg.selectAll(".datamaps-subunit")
        .attr("data-foo", function (d) {
            var center = self.path.centroid(d);
            var xOffset = 7.5, yOffset = 5;

            if (["FL", "KY", "MI"].indexOf(d.id) > -1) xOffset = -2.5;
            if (d.id === "NY") xOffset = -1;
            if (d.id === "MI") yOffset = 18;
            if (d.id === "LA") xOffset = 13;

            var x, y;

            x = center[0] - xOffset;
            y = center[1] + yOffset;

            var smallStateIndex = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"].indexOf(d.id);
            if (smallStateIndex > -1) {
                var yStart = labelStartCoodinates[1];
                x = labelStartCoodinates[0];
                y = yStart + (smallStateIndex * (2 + (options.fontSize || 12)));
                layer.append("line")
                    .attr("x1", x - 3)
                    .attr("y1", y - 5)
                    .attr("x2", center[0])
                    .attr("y2", center[1])
                    .style("stroke", options.labelColor || "#000")
                    .style("stroke-width", options.lineWidth || 1)
            }

            layer.append("text")
                .attr("x", x)
                .attr("y", y)
                .style("font-size", (options.fontSize || 10) + 'px')
                .style("font-family", options.fontFamily || "Verdana")
                .style("fill", options.labelColor || "#000")
                .text(function () {
                    if (options.customLabelText && options.customLabelText[d.id]) {
                        return options.customLabelText[d.id]
                    } else {
                        return d.id
                    }
                });

            return "bar";
        });
}


function handleBubbles(layer, data, options) {
    var self = this,
        fillData = this.options.fills,
        filterData = this.options.filters,
        svg = this.svg;

    if (!data || (data && !data.slice)) {
        throw "Datamaps Error - bubbles must be an array";
    }

    var bubbles = layer.selectAll('circle.datamaps-bubble').data(data, options.key);

    bubbles
        .enter()
        .append('svg:circle')
        .attr('class', 'datamaps-bubble')
        .attr('cx', function (datum) {
            var latLng;
            if (datumHasCoords(datum)) {
                latLng = self.latLngToXY(datum.latitude, datum.longitude);
            }
            else if (datum.centered) {
                latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
            }
            if (latLng) return latLng[0];
        })
        .attr('cy', function (datum) {
            var latLng;
            if (datumHasCoords(datum)) {
                latLng = self.latLngToXY(datum.latitude, datum.longitude);
            }
            else if (datum.centered) {
                latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
            }
            if (latLng) return latLng[1];
        })
        .attr('r', function (datum) {
            // If animation enabled start with radius 0, otherwise use full size.
            return options.animate ? 0 : val(datum.radius, options.radius, datum);
        })
        .attr('data-info', function (datum) {
            return JSON.stringify(datum);
        })
        .attr('filter', function (datum) {
            var filterKey = filterData[val(datum.filterKey, options.filterKey, datum)];

            if (filterKey) {
                return filterKey;
            }
        })
        .style('stroke', function (datum) {
            return val(datum.borderColor, options.borderColor, datum);
        })
        .style('stroke-width', function (datum) {
            return val(datum.borderWidth, options.borderWidth, datum);
        })
        .style('stroke-opacity', function (datum) {
            return val(datum.borderOpacity, options.borderOpacity, datum);
        })
        .style('fill-opacity', function (datum) {
            return val(datum.fillOpacity, options.fillOpacity, datum);
        })
        .style('fill', function (datum) {
            var fillColor = fillData[val(datum.fillKey, options.fillKey, datum)];
            return fillColor || fillData.defaultFill;
        })
        .on('mouseover', function (datum) {
            var $this = d3.select(this);

            if (options.highlightOnHover) {
                // Save all previous attributes for mouseout
                var previousAttributes = {
                    'fill': $this.style('fill'),
                    'stroke': $this.style('stroke'),
                    'stroke-width': $this.style('stroke-width'),
                    'fill-opacity': $this.style('fill-opacity')
                };

                $this
                    .style('fill', val(datum.highlightFillColor, options.highlightFillColor, datum))
                    .style('stroke', val(datum.highlightBorderColor, options.highlightBorderColor, datum))
                    .style('stroke-width', val(datum.highlightBorderWidth, options.highlightBorderWidth, datum))
                    .style('stroke-opacity', val(datum.highlightBorderOpacity, options.highlightBorderOpacity, datum))
                    .style('fill-opacity', val(datum.highlightFillOpacity, options.highlightFillOpacity, datum))
                    .attr('data-previousAttributes', JSON.stringify(previousAttributes));
            }

            if (options.popupOnHover) {
                self.updatePopup($this, datum, options, svg);
            }
        })
        .on('mouseout', function (datum) {
            var $this = d3.select(this);

            if (options.highlightOnHover) {
                // Reapply previous attributes
                var previousAttributes = JSON.parse($this.attr('data-previousAttributes'));
                for (var attr in previousAttributes) {
                    $this.style(attr, previousAttributes[attr]);
                }
            }

            d3.selectAll('.datamaps-hoverover').style('display', 'none');
        })

    bubbles.transition()
        .duration(400)
        .attr('r', function (datum) {
            return val(datum.radius, options.radius, datum);
        })
        .transition()
        .duration(0)
        .attr('data-info', function (d) {
            return JSON.stringify(d);
        });

    bubbles.exit()
        .transition()
        .delay(options.exitDelay)
        .attr("r", 0)
        .remove();

    function datumHasCoords(datum) {
        return typeof datum !== 'undefined' && typeof datum.latitude !== 'undefined' && typeof datum.longitude !== 'undefined';
    }
}

function defaults(obj, options?) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        if (source) {
            for (var prop in source) {
                // Deep copy if property not set
                if (obj[prop] == null) {
                    if (typeof source[prop] == 'function') {
                        obj[prop] = source[prop];
                    }
                    else {
                        obj[prop] = JSON.parse(JSON.stringify(source[prop]));
                    }
                }
            }
        }
    });
    return obj;
}
/**************************************
 Public Functions
 ***************************************/

export class Datamap {
    options:any;
    svg:any;
    handleClick: Function;
    static defaultOptions = {
        scope: 'world',
        responsive: false,
        aspectRatio: 0.5625,
        setProjection: setProjection,
        projection: 'equirectangular',
        dataType: 'json',
        data: {},
        done: function () {
        },
        fills: {
            defaultFill: '#ABDDA4'
        },
        filters: {},
        geographyConfig: {
            dataUrl: null,
            hideAntarctica: true,
            hideHawaiiAndAlaska: false,
            borderWidth: 1,
            borderOpacity: 1,
            borderColor: '#FDFDFD',
            popupTemplate: function (geography, data) {
                return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
            },
            popupOnHover: true,
            highlightOnHover: true,
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2,
            highlightBorderOpacity: 1
        },
        projectionConfig: {
            rotation: [97, 0]
        },
        bubblesConfig: {
            borderWidth: 2,
            borderOpacity: 1,
            borderColor: '#FFFFFF',
            popupOnHover: true,
            radius: null,
            popupTemplate: function (geography, data) {
                return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
            },
            fillOpacity: 0.75,
            animate: true,
            highlightOnHover: true,
            highlightFillColor: '#FC8D59',
            highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            highlightBorderWidth: 2,
            highlightBorderOpacity: 1,
            highlightFillOpacity: 0.85,
            exitDelay: 100,
            key: JSON.stringify
        },
        arcConfig: {
            strokeColor: '#DD1C77',
            strokeWidth: 1,
            arcSharpness: 1,
            animationSpeed: 600,
            popupOnHover: false,
            popupTemplate: function (geography, data) {
                // Case with latitude and longitude
                if (( data.origin && data.destination ) && data.origin.latitude && data.origin.longitude && data.destination.latitude && data.destination.longitude) {
                    return '<div class="hoverinfo"><strong>Arc</strong><br>Origin: ' + JSON.stringify(data.origin) + '<br>Destination: ' + JSON.stringify(data.destination) + '</div>';
                }
                // Case with only country name
                else if (data.origin && data.destination) {
                    return '<div class="hoverinfo"><strong>Arc</strong><br>' + data.origin + ' -> ' + data.destination + '</div>';
                }
                // Missing information
                else {
                    return '';
                }
            }
        }
    };

    constructor(options) {
        if (typeof d3 === 'undefined' || typeof topojson === 'undefined') {
            throw new Error('Include d3.js (v3.0.3 or greater) and topojson on this page before creating a new map');
        }
        // Set options for global use
        this.options = defaults(options, Datamap.defaultOptions);
        this.options.geographyConfig = defaults(options.geographyConfig, Datamap.defaultOptions.geographyConfig);
        this.options.projectionConfig = defaults(options.projectionConfig, Datamap.defaultOptions.projectionConfig);
        this.options.bubblesConfig = defaults(options.bubblesConfig, Datamap.defaultOptions.bubblesConfig);
        this.options.arcConfig = defaults(options.arcConfig, Datamap.defaultOptions.arcConfig);

        // Add the SVG container
        if (d3.select(this.options.element).select('svg').length > 0) {
            addContainer.call(this, this.options.element, this.options.height, this.options.width);
        }

        // Add core plugins to this instance
        this.addPlugin('bubbles', handleBubbles);
        this.addPlugin('legend', addLegend);
        this.addPlugin('arc', handleArcs);
        this.addPlugin('labels', handleLabels);
        this.addPlugin('graticule', addGraticule);

        // Append style block with basic hoverover styles
        if (!this.options.disableDefaultStyles) {
            addStyleBlock();
        }
        this.handleClick = options.handleClick ;
        return this.draw();
    }

    // Resize map
    resize() {

        var self = this;
        var options = self.options;

        if (options.responsive) {
            var newsize:number = options.element.clientWidth,
                oldsize:any = d3.select(options.element).select('svg').attr('data-width');
            var finalSize:number = (newsize / oldsize);
            d3.select(options.element).select('svg').selectAll('g').attr('transform', 'scale(' + finalSize + ')');
        }
    }

    // Actually draw the features(states & countries)
    draw = function () {
        // Save off in a closure
        var self = this;
        var options = self.options;

        // Set projections and paths based on scope
        var pathAndProjection = options.setProjection.apply(this, [options.element, options]);

        this.path = pathAndProjection.path;
        this.projection = pathAndProjection.projection;

        // If custom URL for topojson data, retrieve it and render
        if (options.geographyConfig.dataUrl) {
            d3.json(options.geographyConfig.dataUrl, function (error, results) {
                if (error) throw new Error(error);
                self.customTopo = results;
                draw(results);
            });
        }
        else {
            draw(this[options.scope + 'Topo'] || options.geographyConfig.dataJson);
        }

        return this;

        function draw(data) {
            // If fetching remote data, draw the map first then call `updateChoropleth`
            if (self.options.dataUrl) {
                // Allow for csv or json data types
                d3[self.options.dataType](self.options.dataUrl, function (data) {
                    // In the case of csv, transform data to object
                    if (self.options.dataType === 'csv' && (data && data.slice)) {
                        var tmpData = {};
                        for (var i = 0; i < data.length; i++) {
                            tmpData[data[i].id] = data[i];
                        }
                        data = tmpData;
                    }
                    this.updateChoropleth.call(self, data);
                });
            }
            drawSubunits.call(self, data);
            handleGeographyConfig.call(self);
            let hoverover;
            if (self.options.geographyConfig.popupOnHover || self.options.bubblesConfig.popupOnHover) {
                hoverover = d3.select(self.options.element).append('div')
                    .attr('class', 'datamaps-hoverover')
                    .style('z-index', 10001)
                    .style('position', 'absolute');
            }

            // Fire off finished callback
            self.options.done(self);
        }
    };
    /**************************************
     TopoJSON
     ***************************************/
    worldTopo = worldTopo
        ;
    abwTopo = '__ABW__';
    afgTopo = '__AFG__';
    agoTopo = '__AGO__';
    aiaTopo = '__AIA__';
    albTopo = '__ALB__';
    aldTopo = '__ALD__';
    andTopo = '__AND__';
    areTopo = '__ARE__';
    argTopo = '__ARG__';
    armTopo = '__ARM__';
    asmTopo = '__ASM__';
    ataTopo = '__ATA__';
    atcTopo = '__ATC__';
    atfTopo = '__ATF__';
    atgTopo = '__ATG__';
    ausTopo = '__AUS__';
    autTopo = '__AUT__';
    azeTopo = '__AZE__';
    bdiTopo = '__BDI__';
    belTopo = '__BEL__';
    benTopo = '__BEN__';
    bfaTopo = '__BFA__';
    bgdTopo = '__BGD__';
    bgrTopo = '__BGR__';
    bhrTopo = '__BHR__';
    bhsTopo = '__BHS__';
    bihTopo = '__BIH__';
    bjnTopo = '__BJN__';
    blmTopo = '__BLM__';
    blrTopo = '__BLR__';
    blzTopo = '__BLZ__';
    bmuTopo = '__BMU__';
    bolTopo = '__BOL__';
    braTopo = '__BRA__';
    brbTopo = '__BRB__';
    brnTopo = '__BRN__';
    btnTopo = '__BTN__';
    norTopo = '__NOR__';
    bwaTopo = '__BWA__';
    cafTopo = '__CAF__';
    canTopo = '__CAN__';
    cheTopo = '__CHE__';
    chlTopo = '__CHL__';
    chnTopo = '__CHN__';
    civTopo = '__CIV__';
    clpTopo = '__CLP__';
    cmrTopo = '__CMR__';
    codTopo = '__COD__';
    cogTopo = '__COG__';
    cokTopo = '__COK__';
    colTopo = '__COL__';
    comTopo = '__COM__';
    cpvTopo = '__CPV__';
    criTopo = '__CRI__';
    csiTopo = '__CSI__';
    cubTopo = '__CUB__';
    cuwTopo = '__CUW__';
    cymTopo = '__CYM__';
    cynTopo = '__CYN__';
    cypTopo = '__CYP__';
    czeTopo = '__CZE__';
    deuTopo = '__DEU__';
    djiTopo = '__DJI__';
    dmaTopo = '__DMA__';
    dnkTopo = '__DNK__';
    domTopo = '__DOM__';
    dzaTopo = '__DZA__';
    ecuTopo = '__ECU__';
    egyTopo = '__EGY__';
    eriTopo = '__ERI__';
    esbTopo = '__ESB__';
    espTopo = '__ESP__';
    estTopo = '__EST__';
    ethTopo = '__ETH__';
    finTopo = '__FIN__';
    fjiTopo = '__FJI__';
    flkTopo = '__FLK__';
    fraTopo = '__FRA__';
    froTopo = '__FRO__';
    fsmTopo = '__FSM__';
    gabTopo = '__GAB__';
    psxTopo = '__PSX__';
    gbrTopo = '__GBR__';
    geoTopo = '__GEO__';
    ggyTopo = '__GGY__';
    ghaTopo = '__GHA__';
    gibTopo = '__GIB__';
    ginTopo = '__GIN__';
    gmbTopo = '__GMB__';
    gnbTopo = '__GNB__';
    gnqTopo = '__GNQ__';
    grcTopo = '__GRC__';
    grdTopo = '__GRD__';
    grlTopo = '__GRL__';
    gtmTopo = '__GTM__';
    gumTopo = '__GUM__';
    guyTopo = '__GUY__';
    hkgTopo = '__HKG__';
    hmdTopo = '__HMD__';
    hndTopo = '__HND__';
    hrvTopo = '__HRV__';
    htiTopo = '__HTI__';
    hunTopo = '__HUN__';
    idnTopo = '__IDN__';
    imnTopo = '__IMN__';
    indTopo = '__IND__';
    ioaTopo = '__IOA__';
    iotTopo = '__IOT__';
    irlTopo = '__IRL__';
    irnTopo = '__IRN__';
    irqTopo = '__IRQ__';
    islTopo = '__ISL__';
    isrTopo = '__ISR__';
    itaTopo = '__ITA__';
    jamTopo = '__JAM__';
    jeyTopo = '__JEY__';
    jorTopo = '__JOR__';
    jpnTopo = '__JPN__';
    kabTopo = '__KAB__';
    kasTopo = '__KAS__';
    kazTopo = '__KAZ__';
    kenTopo = '__KEN__';
    kgzTopo = '__KGZ__';
    khmTopo = '__KHM__';
    kirTopo = '__KIR__';
    knaTopo = '__KNA__';
    korTopo = '__KOR__';
    kosTopo = '__KOS__';
    kwtTopo = '__KWT__';
    laoTopo = '__LAO__';
    lbnTopo = '__LBN__';
    lbrTopo = '__LBR__';
    lbyTopo = '__LBY__';
    lcaTopo = '__LCA__';
    lieTopo = '__LIE__';
    lkaTopo = '__LKA__';
    lsoTopo = '__LSO__';
    ltuTopo = '__LTU__';
    luxTopo = '__LUX__';
    lvaTopo = '__LVA__';
    macTopo = '__MAC__';
    mafTopo = '__MAF__';
    marTopo = '__MAR__';
    mcoTopo = '__MCO__';
    mdaTopo = '__MDA__';
    mdgTopo = '__MDG__';
    mdvTopo = '__MDV__';
    mexTopo = '__MEX__';
    mhlTopo = '__MHL__';
    mkdTopo = '__MKD__';
    mliTopo = '__MLI__';
    mltTopo = '__MLT__';
    mmrTopo = '__MMR__';
    mneTopo = '__MNE__';
    mngTopo = '__MNG__';
    mnpTopo = '__MNP__';
    mozTopo = '__MOZ__';
    mrtTopo = '__MRT__';
    msrTopo = '__MSR__';
    musTopo = '__MUS__';
    mwiTopo = '__MWI__';
    mysTopo = '__MYS__';
    namTopo = '__NAM__';
    nclTopo = '__NCL__';
    nerTopo = '__NER__';
    nfkTopo = '__NFK__';
    ngaTopo = '__NGA__';
    nicTopo = '__NIC__';
    niuTopo = '__NIU__';
    nldTopo = '__NLD__';
    nplTopo = '__NPL__';
    nruTopo = '__NRU__';
    nulTopo = '__NUL__';
    nzlTopo = '__NZL__';
    omnTopo = '__OMN__';
    pakTopo = '__PAK__';
    panTopo = '__PAN__';
    pcnTopo = '__PCN__';
    perTopo = '__PER__';
    pgaTopo = '__PGA__';
    phlTopo = '__PHL__';
    plwTopo = '__PLW__';
    pngTopo = '__PNG__';
    polTopo = '__POL__';
    priTopo = '__PRI__';
    prkTopo = '__PRK__';
    prtTopo = '__PRT__';
    pryTopo = '__PRY__';
    pyfTopo = '__PYF__';
    qatTopo = '__QAT__';
    rouTopo = '__ROU__';
    rusTopo = '__RUS__';
    rwaTopo = '__RWA__';
    sahTopo = '__SAH__';
    sauTopo = '__SAU__';
    scrTopo = '__SCR__';
    sdnTopo = '__SDN__';
    sdsTopo = '__SDS__';
    senTopo = '__SEN__';
    serTopo = '__SER__';
    sgpTopo = '__SGP__';
    sgsTopo = '__SGS__';
    shnTopo = '__SHN__';
    slbTopo = '__SLB__';
    sleTopo = '__SLE__';
    slvTopo = '__SLV__';
    smrTopo = '__SMR__';
    solTopo = '__SOL__';
    somTopo = '__SOM__';
    spmTopo = '__SPM__';
    srbTopo = '__SRB__';
    stpTopo = '__STP__';
    surTopo = '__SUR__';
    svkTopo = '__SVK__';
    svnTopo = '__SVN__';
    sweTopo = '__SWE__';
    swzTopo = '__SWZ__';
    sxmTopo = '__SXM__';
    sycTopo = '__SYC__';
    syrTopo = '__SYR__';
    tcaTopo = '__TCA__';
    tcdTopo = '__TCD__';
    tgoTopo = '__TGO__';
    thaTopo = '__THA__';
    tjkTopo = '__TJK__';
    tkmTopo = '__TKM__';
    tlsTopo = '__TLS__';
    tonTopo = '__TON__';
    ttoTopo = '__TTO__';
    tunTopo = '__TUN__';
    turTopo = '__TUR__';
    tuvTopo = '__TUV__';
    twnTopo = '__TWN__';
    tzaTopo = '__TZA__';
    ugaTopo = '__UGA__';
    ukrTopo = '__UKR__';
    umiTopo = '__UMI__';
    uryTopo = '__URY__';
    usaTopo = '__USA__';
    usgTopo = '__USG__';
    uzbTopo = '__UZB__';
    vatTopo = '__VAT__';
    vctTopo = '__VCT__';
    venTopo = '__VEN__';
    vgbTopo = '__VGB__';
    virTopo = '__VIR__';
    vnmTopo = '__VNM__';
    vutTopo = '__VUT__';
    wlfTopo = '__WLF__';
    wsbTopo = '__WSB__';
    wsmTopo = '__WSM__';
    yemTopo = '__YEM__';
    zafTopo = '__ZAF__';
    zmbTopo = '__ZMB__';
    zweTopo = '__ZWE__';

    /**************************************
     Utilities
     ***************************************/

    // Convert lat/lng coords to X / Y coords
    latLngToXY(lat, lng) {
        return (<any>this).projection([lng, lat]);
    };

    // Add <g> layer to root SVG
    addLayer(className, id, first) {
        var layer;
        if (first) {
            layer = this.svg.insert('g', ':first-child')
        }
        else {
            layer = this.svg.append('g')
        }
        return layer.attr('id', id || '')
            .attr('class', className || '');
    };

    updateChoropleth(data, options) {
        var svg = this.svg;
        var that = this;

        // When options.reset = true, reset all the fill colors to the defaultFill and kill all data-info
        if (options && options.reset === true) {
            svg.selectAll('.datamaps-subunit')
                .attr('data-info', function () {
                    return "{}"
                })
                .transition().style('fill', this.options.fills.defaultFill)
        }

        for (var subunit in data) {
            if (data.hasOwnProperty(subunit)) {
                var color;
                var subunitData = data[subunit]
                if (!subunit) {
                    continue;
                }
                else if (typeof subunitData === "string") {
                    color = subunitData;
                }
                else if (typeof subunitData.color === "string") {
                    color = subunitData.color;
                }
                else if (typeof subunitData.fillColor === "string") {
                    color = subunitData.fillColor;
                }
                else {
                    color = this.options.fills[subunitData.fillKey];
                }
                // If it's an object, overriding the previous data
                if (subunitData === Object(subunitData)) {
                    this.options.data[subunit] = defaults(subunitData, this.options.data[subunit] || {});
                    var geo = this.svg.select('.' + subunit).attr('data-info', JSON.stringify(this.options.data[subunit]));
                }
                svg
                    .selectAll('.' + subunit)
                    .transition()
                    .style('fill', color);
            }
        }
    };

    renderTooltip(element, d, options) {
        var self = this;
        var position = d3.mouse(self.options.element);
        d3.select(self.svg[0][0].parentNode).select('.datamaps-hoverover')
            .style('top', ( (position[1] + 30)) + "px")
            .html(function () {
                var data = JSON.parse(element.attr('data-info'));
                try {
                    return options.popupTemplate(d, data);
                } catch (e) {
                    return "";
                }
            })
            .style('left', ( position[0]) + "px");
        d3.select(self.svg[0][0].parentNode).select('.datamaps-hoverover').style('display', 'block');
    }

    updatePopup(element, d, options) {
        var self = this;
        // element.on('click', null);
        // element.on('mousemove', null);
        element.on('click', () => {
            self.renderTooltip(element, d, options);
            if(self.handleClick) {
                self.handleClick(element, d, options);
            }
        });


    };

    addPlugin(name, pluginFn) {
        var self = this;
        if (typeof Datamap.prototype[name] === "undefined") {
            Datamap.prototype[name] = function (data, options, callback, createNewLayer) {
                var layer;
                if (typeof createNewLayer === "undefined") {
                    createNewLayer = false;
                }

                if (typeof options === 'function') {
                    callback = options;
                    options = undefined;
                }

                options = defaults(options || {}, self.options[name + 'Config']);

                // Add a single layer, reuse the old layer
                if (!createNewLayer && this.options[name + 'Layer']) {
                    layer = this.options[name + 'Layer'];
                    options = options || this.options[name + 'Options'];
                }
                else {
                    layer = this.addLayer(name);
                    this.options[name + 'Layer'] = layer;
                    this.options[name + 'Options'] = options;
                }
                pluginFn.apply(this, [layer, data, options]);
                if (callback) {
                    callback(layer);
                }
            };
        }
    };

}

export class Zoom {
    $buttons:any;
    $info:any;
    scale:any;
    datamap:any;
    $container:any;
    scrolled:boolean;
    d3Zoom:any;

    constructor(args) {
        $.extend(this, {
            $buttons: args.$buttons,
            $info: args.$info,
            scale: {max: 50, currentShift: 0},
            $container: $(args.$container),
            datamap: args.datamap
        });

    }

    setZoomButton(className = ".zoom-button") {
        this.$buttons = $(className);
    }

    setInfoButton(className = ".zoom-button") {
        this.$buttons = $(className);
    }

    init() {
        var paths = this.datamap.svg.selectAll("path"),
            subunits = this.datamap.svg.selectAll(".datamaps-subunit");

        // preserve stroke thickness
        // paths.style("vector-effect", "non-scaling-stroke");

        // disable click on drag end
        subunits.call(
            d3.behavior.drag().on("dragend", function () {
                (<any>(d3.event)).sourceEvent.stopPropagation();
            })
        );

        this.scale.set = this._getScalesArray();
        this.d3Zoom = d3.behavior.zoom().scaleExtent([1, this.scale.max]);

        this._displayPercentage(1);
        this.listen();
    };

    listen() {
        if(this.$buttons) {
            this.$buttons.off("click").on("click", this._handleClick.bind(this));
        }
        this.datamap.svg
            .call(this.d3Zoom.on("zoom", this._handleScroll.bind(this)))
            .on("dblclick.zoom"); 
    };

    _getScalesArray() {
        var array = [],
            scaleMaxLog = Math.log(this.scale.max);

        for (var i = 0; i <= 10; i++) {
            array.push(Math.pow(Math.E, 0.1 * i * scaleMaxLog));
        }

        return array;
    };

    reset() {
        this._shift("reset");
    };


    _handleScroll() {
        var translate = (<any>(d3.event)).translate,
            scale = (<any>(d3.event)).scale,
            limited = this._bound(translate, scale);

        this.scrolled = true;

        this._update(limited.translate, limited.scale);
    };

    _handleClick(event) {
        var direction = $(event.target).data("zoom");

        this._shift(direction);
    };

    _shift(direction) {
        var center = [this.$container.width() / 2, this.$container.height() / 2],
            translate = this.d3Zoom.translate(), translate0 = [], l = [],
            view = {
                x: translate[0],
                y: translate[1],
                k: this.d3Zoom.scale()
            }, bounded;

        translate0 = [
            (center[0] - view.x) / view.k,
            (center[1] - view.y) / view.k
        ];

        if (direction == "reset") {
            view.k = 1;
            this.scrolled = true;
        } else {
            view.k = this._getNextScale(direction);
        }

        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

        view.x += center[0] - l[0];
        view.y += center[1] - l[1];

        bounded = this._bound([view.x, view.y], view.k);

        this._animate(bounded.translate, bounded.scale);
    };

    _bound(translate, scale) {
        var width = this.$container.width(),
            height = this.$container.height();

        translate[0] = Math.min(
            (width / height) * (scale - 1),
            Math.max(width * (1 - scale), translate[0])
        );

        translate[1] = Math.min(0, Math.max(height * (1 - scale), translate[1]));

        return {translate: translate, scale: scale};
    };

    _update(translate, scale) {
        this.d3Zoom
            .translate(translate)
            .scale(scale);

        this.datamap.svg.selectAll("g")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        this._displayPercentage(scale);
    };

    _animate(translate, scale) {
        var _this = this,
            d3Zoom = this.d3Zoom;

        d3.transition().duration(350).tween("zoom", function () {
            var iTranslate = d3.interpolate(d3Zoom.translate(), translate),
                iScale = d3.interpolate(d3Zoom.scale(), scale);

            return function (t) {
                _this._update(iTranslate(t), iScale(t));
            };
        });
    };

    _displayPercentage(scale) {
        var value;

        value = Math.round(Math.log(scale) / Math.log(this.scale.max) * 100);
        if(this.$info) {
            this.$info.text(value + "%");
        }
    };


    _getNextScale(direction) {
        var scaleSet = this.scale.set,
            currentScale = this.d3Zoom.scale(),
            lastShift = scaleSet.length - 1,
            shift, temp = [];

        if (this.scrolled) {

            for (shift = 0; shift <= lastShift; shift++) {
                temp.push(Math.abs(scaleSet[shift] - currentScale));
            }

            shift = temp.indexOf(Math.min.apply(null, temp));

            if (currentScale >= scaleSet[shift] && shift < lastShift) {
                shift++;
            }

            if (direction == "out" && shift > 0) {
                shift--;
            }

            this.scrolled = false;

        } else {

            shift = this.scale.currentShift;

            if (direction == "out") {
                shift > 0 && shift--;
            } else {
                shift < lastShift && shift++;
            }
        }

        this.scale.currentShift = shift;

        return scaleSet[shift];
    };

}
