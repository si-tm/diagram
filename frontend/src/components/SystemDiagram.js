import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SystemDiagram.css';

const SystemDiagram = ({ nodes, viewLevel }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // SVGのクリア
    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // ズームとパンの設定
    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 色の定義
    const colorScale = d3.scaleOrdinal()
      .domain(['SoR', 'decoupling', 'SoE'])
      .range(['#4CAF50', '#2196F3', '#FF9800']);

    // viewLevelに基づいてノードをグループ化
    let groupedNodes;
    if (viewLevel === 'systemType') {
      groupedNodes = d3.group(nodes, d => d.systemType);
    } else if (viewLevel === 'systemName') {
      groupedNodes = d3.group(nodes, d => `${d.systemType}-${d.systemName}`);
    } else {
      groupedNodes = d3.group(nodes, d => `${d.systemType}-${d.systemName}-${d.apiPath}`);
    }

    // グループノードの作成
    const groupNodes = [];
    groupedNodes.forEach((nodeList, key) => {
      const firstNode = nodeList[0];
      
      let label, groupId;
      if (viewLevel === 'systemType') {
        label = firstNode.systemType;
        groupId = firstNode.systemType;
      } else if (viewLevel === 'systemName') {
        label = firstNode.systemName;
        groupId = `${firstNode.systemType}-${firstNode.systemName}`;
      } else {
        label = `${firstNode.systemName}\n${firstNode.apiPath}`;
        groupId = key;
      }

      groupNodes.push({
        id: groupId,
        label: label,
        systemType: firstNode.systemType,
        nodes: nodeList,
        isError: nodeList.some(n => n.isError)
      });
    });

    // X位置を固定（左・中央・右）
    const xPositions = {
      'SoR': width * 0.2,
      'decoupling': width * 0.5,
      'SoE': width * 0.8
    };

    // グループノードのY位置を計算
    const typeGroups = d3.group(groupNodes, d => d.systemType);
    typeGroups.forEach((groups, type) => {
      const ySpacing = height / (groups.length + 1);
      groups.forEach((group, index) => {
        group.x = xPositions[type];
        group.y = ySpacing * (index + 1);
        group.fx = xPositions[type]; // X位置を固定
      });
    });

    // リンクデータの作成（グループ間）
    const groupLinks = [];
    const linkMap = new Map();

    nodes.forEach(node => {
      if (node.apiCallTargetId) {
        const targetNode = nodes.find(n => n.id === node.apiCallTargetId);
        if (targetNode) {
          let sourceGroupId, targetGroupId;
          
          if (viewLevel === 'systemType') {
            sourceGroupId = node.systemType;
            targetGroupId = targetNode.systemType;
          } else if (viewLevel === 'systemName') {
            sourceGroupId = `${node.systemType}-${node.systemName}`;
            targetGroupId = `${targetNode.systemType}-${targetNode.systemName}`;
          } else {
            sourceGroupId = `${node.systemType}-${node.systemName}-${node.apiPath}`;
            targetGroupId = `${targetNode.systemType}-${targetNode.systemName}-${targetNode.apiPath}`;
          }

          const linkKey = `${sourceGroupId}-${targetGroupId}`;
          if (!linkMap.has(linkKey) && sourceGroupId !== targetGroupId) {
            linkMap.set(linkKey, true);
            groupLinks.push({
              source: sourceGroupId,
              target: targetGroupId
            });
          }
        }
      }
    });

    // 矢印マーカーの定義
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // システムタイプの背景エリア
    const backgroundAreas = g.append('g').attr('class', 'background-areas');
    
    ['SoR', 'decoupling', 'SoE'].forEach(type => {
      const x = xPositions[type];
      backgroundAreas.append('rect')
        .attr('x', x - 120)
        .attr('y', 50)
        .attr('width', 240)
        .attr('height', height - 100)
        .attr('fill', colorScale(type))
        .attr('opacity', 0.05)
        .attr('rx', 10);
      
      backgroundAreas.append('text')
        .attr('x', x)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', colorScale(type))
        .text(type === 'SoR' ? 'SoR (System of Record)' : 
              type === 'decoupling' ? 'Decoupling Layer' : 
              'SoE (System of Engagement)');
    });

    // リンクの描画
    const link = g.append('g')
      .selectAll('line')
      .data(groupLinks)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // グループノードの描画
    const groupNode = g.append('g')
      .selectAll('g')
      .data(groupNodes)
      .enter().append('g')
      .attr('class', 'group-node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // グループノードの円（またはカウント表示）
    const nodeSize = viewLevel === 'systemType' ? 50 : 
                     viewLevel === 'systemName' ? 40 : 35;

    groupNode.append('circle')
      .attr('r', nodeSize)
      .attr('fill', d => d.isError ? '#f44336' : colorScale(d.systemType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('filter', d => d.isError ? 'drop-shadow(0 0 8px #f44336)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    // ノード数バッジ
    if (viewLevel === 'systemType' || viewLevel === 'systemName') {
      groupNode.append('circle')
        .attr('cx', nodeSize * 0.6)
        .attr('cy', -nodeSize * 0.6)
        .attr('r', 15)
        .attr('fill', '#fff')
        .attr('stroke', d => d.isError ? '#f44336' : colorScale(d.systemType))
        .attr('stroke-width', 2);

      groupNode.append('text')
        .attr('x', nodeSize * 0.6)
        .attr('y', -nodeSize * 0.6)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', d => d.isError ? '#f44336' : colorScale(d.systemType))
        .text(d => d.nodes.length);
    }

    // グループラベル
    groupNode.each(function(d) {
      const lines = d.label.split('\n');
      const textGroup = d3.select(this);
      
      lines.forEach((line, i) => {
        textGroup.append('text')
          .attr('dy', (nodeSize + 20 + i * 16))
          .attr('text-anchor', 'middle')
          .attr('class', 'group-label')
          .text(line)
          .style('font-weight', i === 0 ? 'bold' : 'normal')
          .style('font-size', i === 0 ? '14px' : '12px')
          .style('fill', '#333');
      });
    });

    // ツールチップ
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    groupNode.on('mouseover', (event, d) => {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      
      const nodeDetails = d.nodes.map(n => 
        `<div class="tooltip-node">
          <strong>${n.component}</strong><br/>
          ${n.apiPath}
          ${n.isError ? '<span style="color: #f44336;"> ⚠</span>' : ''}
        </div>`
      ).join('');
      
      tooltip.html(`
        <strong>${d.label}</strong><br/>
        <div style="margin-top: 8px;">
          <em>ノード数: ${d.nodes.length}</em>
        </div>
        <div class="tooltip-nodes" style="margin-top: 8px; max-height: 200px; overflow-y: auto;">
          ${nodeDetails}
        </div>
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

    // リンクの位置更新
    function updateLinks() {
      link
        .attr('x1', d => {
          const source = groupNodes.find(n => n.id === d.source);
          return source ? source.x : 0;
        })
        .attr('y1', d => {
          const source = groupNodes.find(n => n.id === d.source);
          return source ? source.y : 0;
        })
        .attr('x2', d => {
          const target = groupNodes.find(n => n.id === d.target);
          return target ? target.x : 0;
        })
        .attr('y2', d => {
          const target = groupNodes.find(n => n.id === d.target);
          return target ? target.y : 0;
        });
    }

    updateLinks();

    // クリーンアップ
    return () => {
      tooltip.remove();
    };
  }, [nodes, viewLevel]);

  return (
    <div id="diagram-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default SystemDiagram;
