const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// サンプルデータ - より充実したデータセット
const sampleNodes = [
  // SoR - JOINT System
  {
    id: 'node1',
    systemType: 'SoR',
    systemName: 'JOINT',
    apiPath: '/v1/ryoukin',
    apiCallerId: null,
    apiCallTargetId: 'node6',
    component: 'keiyaku button',
    isError: false
  },
  {
    id: 'node2',
    systemType: 'SoR',
    systemName: 'JOINT',
    apiPath: '/v1/keiyaku',
    apiCallerId: null,
    apiCallTargetId: 'node6',
    component: 'keiyaku form',
    isError: false
  },
  {
    id: 'node3',
    systemType: 'SoR',
    systemName: 'JOINT',
    apiPath: '/v1/customer',
    apiCallerId: null,
    apiCallTargetId: 'node7',
    component: 'customer management',
    isError: false
  },
  
  // SoR - Legacy System
  {
    id: 'node4',
    systemType: 'SoR',
    systemName: 'Legacy DB',
    apiPath: '/v1/contract/list',
    apiCallerId: null,
    apiCallTargetId: 'node7',
    component: 'contract database',
    isError: false
  },
  {
    id: 'node5',
    systemType: 'SoR',
    systemName: 'Legacy DB',
    apiPath: '/v1/contract/update',
    apiCallerId: null,
    apiCallTargetId: 'node6',
    component: 'contract updater',
    isError: false
  },
  
  // Decoupling - API Gateway
  {
    id: 'node6',
    systemType: 'decoupling',
    systemName: 'API Gateway',
    apiPath: '/v1/process',
    apiCallerId: 'node1',
    apiCallTargetId: 'node10',
    component: 'gateway service',
    isError: false
  },
  {
    id: 'node7',
    systemType: 'decoupling',
    systemName: 'API Gateway',
    apiPath: '/v1/transform',
    apiCallerId: 'node3',
    apiCallTargetId: 'node11',
    component: 'data transformer',
    isError: false
  },
  
  // Decoupling - Message Queue
  {
    id: 'node8',
    systemType: 'decoupling',
    systemName: 'Message Queue',
    apiPath: '/v1/queue/contracts',
    apiCallerId: 'node2',
    apiCallTargetId: 'node12',
    component: 'contract queue',
    isError: false
  },
  {
    id: 'node9',
    systemType: 'decoupling',
    systemName: 'Message Queue',
    apiPath: '/v1/queue/notifications',
    apiCallerId: 'node4',
    apiCallTargetId: 'node13',
    component: 'notification queue',
    isError: false
  },
  
  // SoE - Customer Portal
  {
    id: 'node10',
    systemType: 'SoE',
    systemName: 'Customer Portal',
    apiPath: '/v1/display',
    apiCallerId: 'node6',
    apiCallTargetId: null,
    component: 'display component',
    isError: true
  },
  {
    id: 'node11',
    systemType: 'SoE',
    systemName: 'Customer Portal',
    apiPath: '/v1/dashboard',
    apiCallerId: 'node7',
    apiCallTargetId: null,
    component: 'dashboard view',
    isError: false
  },
  {
    id: 'node12',
    systemType: 'SoE',
    systemName: 'Customer Portal',
    apiPath: '/v1/profile',
    apiCallerId: 'node8',
    apiCallTargetId: null,
    component: 'profile page',
    isError: false
  },
  
  // SoE - Mobile App
  {
    id: 'node13',
    systemType: 'SoE',
    systemName: 'Mobile App',
    apiPath: '/v1/mobile/home',
    apiCallerId: 'node9',
    apiCallTargetId: null,
    component: 'mobile home',
    isError: false
  },
  {
    id: 'node14',
    systemType: 'SoE',
    systemName: 'Mobile App',
    apiPath: '/v1/mobile/contracts',
    apiCallerId: 'node6',
    apiCallTargetId: null,
    component: 'mobile contracts',
    isError: false
  },
  
  // SoE - Admin Console
  {
    id: 'node15',
    systemType: 'SoE',
    systemName: 'Admin Console',
    apiPath: '/v1/admin/users',
    apiCallerId: 'node7',
    apiCallTargetId: null,
    component: 'user management',
    isError: false
  },
  {
    id: 'node16',
    systemType: 'SoE',
    systemName: 'Admin Console',
    apiPath: '/v1/admin/reports',
    apiCallerId: 'node8',
    apiCallTargetId: null,
    component: 'report generator',
    isError: false
  }
];

// APIエンドポイント
app.get('/api/nodes', (req, res) => {
  res.json(sampleNodes);
});

app.get('/api/nodes/:id', (req, res) => {
  const node = sampleNodes.find(n => n.id === req.params.id);
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: 'Node not found' });
  }
});

// エラーノードとその接続ノードを取得
app.get('/api/error-trace', (req, res) => {
  const errorNodes = sampleNodes.filter(n => n.isError);
  
  const traceNodes = new Set();
  
  const addConnectedNodes = (nodeId) => {
    const node = sampleNodes.find(n => n.id === nodeId);
    if (!node || traceNodes.has(nodeId)) return;
    
    traceNodes.add(nodeId);
    
    // API call targetを追加
    if (node.apiCallTargetId) {
      addConnectedNodes(node.apiCallTargetId);
    }
    
    // API callerを追加
    if (node.apiCallerId) {
      addConnectedNodes(node.apiCallerId);
    }
    
    // このノードを呼び出している他のノードも追加
    sampleNodes
      .filter(n => n.apiCallTargetId === nodeId)
      .forEach(n => addConnectedNodes(n.id));
  };
  
  errorNodes.forEach(node => addConnectedNodes(node.id));
  
  const result = sampleNodes.filter(n => traceNodes.has(n.id));
  res.json(result);
});

app.post('/api/nodes', (req, res) => {
  const newNode = req.body;
  sampleNodes.push(newNode);
  res.status(201).json(newNode);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
