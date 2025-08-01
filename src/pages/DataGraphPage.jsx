// src/pages/DataGraphPage.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { generateGraphData, categoryColors } from '../services/graphDataService';
import { categoryMap } from '../services/glossaryService';
import '../styles/graph.css';

export default function DataGraphPage() {
    const containerRef = useRef(null);
    const fgRef = useRef();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [processedGraphData, setProcessedGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredNode, setHoveredNode] = useState(null);
    const [highlight, setHighlight] = useState({ nodes: new Set(), links: new Set() });
    const [centralNodeImage, setCentralNodeImage] = useState(null);
    const navigate = useNavigate();
    const hasFitted = useRef(false);

    // Load the image for the central node
    useEffect(() => {
        const img = new Image();
        img.src = './Brainworms Glossary_files/favico.webp';
        img.onload = () => setCentralNodeImage(img);
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setIsLoading(true);
                hasFitted.current = false; // Reset fit state for new data
                const data = await generateGraphData();
                setGraphData(data);
            } catch {
                setError('Failed to load graph data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchGraphData();
    }, []);

    // Pre-process data to calculate text-aware collision radius
    useEffect(() => {
        if (isLoading || !graphData.nodes.length) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const nodesWithCollisionRadii = graphData.nodes.map(node => {
            const isCategory = node.type === 'category';
            ctx.font = isCategory ? '16px Sans-Serif' : '10px Sans-SerF';
            const textWidth = ctx.measureText(node.name).width;
            const collisionRadius = Math.max(node.radius * 1.2, textWidth / 2) + (isCategory ? 12 : 6);
            return { ...node, collisionRadius };
        });

        setProcessedGraphData({
            nodes: nodesWithCollisionRadii,
            links: graphData.links,
        });

    }, [isLoading, graphData]);
    
    // Handle node hover to highlight connections
    useEffect(() => {
        if (hoveredNode) {
            const newHighlight = {
                nodes: new Set([hoveredNode.id]),
                links: new Set()
            };
            processedGraphData.links.forEach(link => {
                if (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id) {
                    newHighlight.links.add(link);
                    newHighlight.nodes.add(link.source.id);
                    newHighlight.nodes.add(link.target.id);
                }
            });
            setHighlight(newHighlight);
        } else {
            setHighlight({ nodes: new Set(), links: new Set() });
        }
    }, [hoveredNode, processedGraphData]);

    // Set up and configure the force simulation
    useEffect(() => {
        if (!fgRef.current || !processedGraphData || !dimensions.width) return;

        const fg = fgRef.current;

        fg.d3Force('x', d3.forceX(dimensions.width / 2).strength(0.05));
        fg.d3Force('y', d3.forceY(dimensions.height / 2).strength(0.05));
        fg.d3Force('charge', d3.forceManyBody().strength(-800));
        fg.d3Force('link').distance(link => {
            if (link.type === 'central-category') return 250;
            if (link.type === 'category') return 120;
            return 60;
        }).strength(0.07);
        fg.d3Force('collide', d3.forceCollide()
            .radius(d => d.collisionRadius)
            .strength(1)
            .iterations(4)
        );

        fg.d3ReheatSimulation();

    }, [processedGraphData, dimensions]);

    // Get container dimensions reliably
    useEffect(() => {
        if (isLoading) return;

        const observer = new ResizeObserver(entries => {
            if (!entries || !entries.length) return;
            const { width } = entries[0].contentRect;
            const height = window.innerHeight - 120;
            if (width > 0 && height > 0) {
                setDimensions({ width, height });
                hasFitted.current = false; // Refit on resize
            }
        });

        const ref = containerRef.current;
        if (ref) observer.observe(ref);
        return () => { if (ref) observer.unobserve(ref) };
    }, [isLoading]);


    const handleNodeClick = useCallback((node) => {
        if (node.type === 'central') navigate('/');
        else if (node.type === 'category') navigate(`/category/${node.categorySlug || categoryMap[node.categoryId].urlSlug}`);
        else if (node.type === 'term') navigate(`/term/${node.id}`);
    }, [navigate]);

    const nodePaint = useCallback((node, ctx, globalScale) => {
        ctx.save();
        if (hoveredNode && !highlight.nodes.has(node.id)) {
            ctx.globalAlpha = 0.15;
        }

        if (node.id === 'brainworms-central' && centralNodeImage) {
            const size = node.radius * 2.5;
            ctx.drawImage(centralNodeImage, node.x - size / 2, node.y - size / 2, size, size);
            ctx.restore(); // Restore context early for the image node
            return;
        }

        const label = node.type === 'term' && node.name.length > 10 
            ? node.name.substring(0, 10) + '...' 
            : node.name;
        
        const isCategory = node.type === 'category';
        const baseFontSize = isCategory ? 16 : 10;
        const fontSize = Math.max(isCategory ? 12 : 8, baseFontSize / globalScale);
        ctx.font = `${fontSize}px Sans-Serif`;

        const drawRadius = node.radius * 1.2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, drawRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || '#789';
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = node.isDefiningTerm ? 3 / globalScale : 1.5 / globalScale;
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(label, node.x, node.y);
        ctx.restore();
    }, [centralNodeImage, hoveredNode, highlight]);
    
    const linkColor = useCallback(link => {
        if (hoveredNode && !highlight.links.has(link)) {
            return 'rgba(200, 200, 200, 0.05)';
        }
        if (link.source.id === 'brainworms-central') {
            const targetCategory = link.target.categoryId;
            return categoryColors[targetCategory] ? `${categoryColors[targetCategory]}E6` : 'rgba(100, 100, 100, 0.9)';
        }
        const sourceCategory = link.source.categoryId;
        return categoryColors[sourceCategory] ? `${categoryColors[sourceCategory]}B3` : 'rgba(200, 200, 200, 0.7)';
    }, [hoveredNode, highlight]);

    const linkWidth = useCallback(link => {
        if (hoveredNode && !highlight.links.has(link)) {
            return 0.2;
        }
        switch(link.type) {
            case 'central-category': return 4;
            case 'category': return 1;
            case 'related': return 2;
            default: return 0.5;
        }
    }, [hoveredNode, highlight]);

    if (isLoading) {
        return <div className="loading-container">Loading graph...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div ref={containerRef} className="graph-container" style={{ width: '90%', margin: '0 auto', height: 'calc(100vh - 120px)', minHeight: '500px' }}>
            {dimensions.width > 0 && processedGraphData ? (
                <ForceGraph2D
                    ref={fgRef}
                    graphData={processedGraphData}
                    width={dimensions.width}
                    height={dimensions.height}
                    nodeId="id"
                    nodeVal="radius"
                    nodeLabel="name"
                    nodeRelSize={8}
                    nodeColor={node => node.color || '#789'}
                    linkColor={linkColor}
                    linkWidth={linkWidth}
                    onNodeClick={handleNodeClick}
                    onNodeHover={setHoveredNode}
                    nodeCanvasObject={nodePaint}
                    nodeCanvasObjectMode={() => 'replace'}
                    forceEngine="d3"
                    warmupTicks={200}
                    cooldownTicks={0}
                    onEngineStop={() => {
                        if (!hasFitted.current) {
                            fgRef.current.zoomToFit(400, 300); // Further increased padding
                            hasFitted.current = true;
                        }
                    }}
                    enableNodeDrag={true}
                    enableZoomInteraction={true}
                    minZoom={0.05}
                    maxZoom={12}
                />
            ) : (
                <div className="loading-container">Waiting for container dimensions...</div>
            )}
        </div>
    );
}