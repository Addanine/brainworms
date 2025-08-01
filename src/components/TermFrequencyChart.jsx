// src/components/TermFrequencyChart.jsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function TermFrequencyChart({ data, selectedTerms = ['hon', 'pooner', 'boymoder', 'gigahon'], selectedPlatforms = ['lgbt', 'r4tran'] }) {
    const svgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    useEffect(() => {
        const handleResize = () => {
            const container = svgRef.current?.parentElement;
            if (container) {
                const containerWidth = container.clientWidth;
                const isMobile = window.innerWidth <= 480;
                const minWidth = isMobile ? 600 : 400;
                const padding = isMobile ? 10 : 40;
                
                setDimensions({
                    width: Math.max(minWidth, containerWidth - padding),
                    height: isMobile ? 350 : 400
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!data || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const isMobile = window.innerWidth <= 480;
        const margin = isMobile 
            ? { top: 15, right: 100, bottom: 50, left: 45 }
            : { top: 20, right: 120, bottom: 60, left: 60 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        // Use data directly from service (already processed)
        if (!data || data.length === 0) {
            // Show "no data" message
            svg.append('text')
                .attr('x', dimensions.width / 2)
                .attr('y', dimensions.height / 2)
                .attr('text-anchor', 'middle')
                .attr('class', 'no-data-text')
                .style('fill', '#666')
                .style('font-size', '16px')
                .text('No frequency data available');
            return;
        }

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate max value across all term-platform combinations
        let maxValue = 0;
        selectedTerms.forEach(term => {
            selectedPlatforms.forEach(platform => {
                const termPlatformKey = `${term}_${platform}`;
                const maxForThisSeries = d3.max(data, d => d[termPlatformKey] || 0);
                maxValue = Math.max(maxValue, maxForThisSeries);
            });
        });

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .nice()
            .range([height, 0]);

        // 4chan-themed color palette
        const colorScale = d3.scaleOrdinal()
            .domain(selectedTerms)
            .range(['#d00', '#34345c', '#789922', '#117743', '#000080', '#800080', '#ff6600', '#008b8b']);

        // Axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%b %Y'));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d3.format('d'));

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        g.append('g')
            .call(yAxis);

        // Grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickSize(-height)
                .tickFormat('')
            )
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3);

        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            )
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0.3);

        // Lines for each term and platform combination
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.total))
            .curve(d3.curveMonotoneX);

        selectedTerms.forEach(term => {
            selectedPlatforms.forEach(platform => {
                const termPlatformKey = `${term}_${platform}`;
                // Filter out zero values but keep data structure
                const lineData = data.map(d => ({
                    date: d.date,
                    total: d[termPlatformKey] || 0
                })).filter(d => d.total > 0);
                
                if (lineData.length === 0) return;

                const platformColor = colorScale(term);
                const isDashed = platform === 'r4tran';

                // Line path
                g.append('path')
                    .datum(lineData)
                    .attr('fill', 'none')
                    .attr('stroke', platformColor)
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', isDashed ? '5,5' : 'none')
                    .attr('d', line);

                // Data points
                g.selectAll(`.dot-${term}-${platform}`)
                    .data(lineData)
                    .enter().append('circle')
                    .attr('class', `dot-${term}-${platform}`)
                    .attr('cx', d => xScale(d.date))
                    .attr('cy', d => yScale(d.total))
                    .attr('r', 4)
                    .attr('fill', platformColor)
                    .attr('stroke', isDashed ? '#fff' : 'none')
                    .attr('stroke-width', isDashed ? 1 : 0)
                    .on('mouseover', function(event, d) {
                        // Tooltip
                        const tooltip = d3.select('body').append('div')
                            .attr('class', 'chart-tooltip')
                            .style('opacity', 0)
                            .style('position', 'absolute')
                            .style('background', 'rgba(0,0,0,0.8)')
                            .style('color', 'white')
                            .style('padding', '8px')
                            .style('border-radius', '4px')
                            .style('font-size', '12px')
                            .style('pointer-events', 'none')
                            .style('z-index', '1000');

                        tooltip.transition()
                            .duration(200)
                            .style('opacity', .9);
                        
                        const platformName = platform === 'lgbt' ? '/lgbt/' : 'r/4tran4';
                        tooltip.html(`${term} on ${platformName}: ${d.total} mentions<br/>${d3.timeFormat('%b %Y')(d.date)}`)
                            .style('left', (event.pageX + 10) + 'px')
                            .style('top', (event.pageY - 28) + 'px');
                    })
                    .on('mouseout', function() {
                        d3.selectAll('.chart-tooltip').remove();
                    });
            });
        });

        // Enhanced Legend with platform indicators
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + margin.left + 10}, ${margin.top})`);

        let legendIndex = 0;
        selectedTerms.forEach(term => {
            selectedPlatforms.forEach(platform => {
                const legendRow = legend.append('g')
                    .attr('transform', `translate(0, ${legendIndex * 18})`);

                const isDashed = platform === 'r4tran';
                const platformSymbol = platform === 'lgbt' ? '—' : '- -';
                const platformName = platform === 'lgbt' ? '/lgbt/' : 'r/4tran4';

                legendRow.append('line')
                    .attr('x1', 0)
                    .attr('x2', 14)
                    .attr('y1', 3)
                    .attr('y2', 3)
                    .attr('stroke', colorScale(term))
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', isDashed ? '3,3' : 'none');

                legendRow.append('text')
                    .attr('x', 18)
                    .attr('y', 7)
                    .style('font-size', '11px')
                    .style('fill', '#333')
                    .text(`${term} (${platformName})`);

                legendIndex++;
            });
        });

        // Axes labels
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text('Frequency (posts/comments)');

        g.append('text')
            .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text('Time Period');

    }, [data, selectedTerms, selectedPlatforms, dimensions]);

    return (
        <div className="chart-container">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        </div>
    );
}

