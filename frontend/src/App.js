import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SystemDiagram from './components/SystemDiagram';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [nodes, setNodes] = useState([]);
  const [errorTraceNodes, setErrorTraceNodes] = useState([]);
  const [showErrorTrace, setShowErrorTrace] = useState(false);
  const [viewLevel, setViewLevel] = useState('systemType'); // 'systemType' | 'systemName' | 'apiPath'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNodes();
    fetchErrorTrace();
  }, []);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/nodes`);
      setNodes(response.data);
      setError(null);
    } catch (err) {
      setError('ノードの読み込みに失敗しました');
      console.error('Error fetching nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorTrace = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/error-trace`);
      setErrorTraceNodes(response.data);
    } catch (err) {
      console.error('Error fetching error trace:', err);
    }
  };

  const handleToggleErrorTrace = () => {
    setShowErrorTrace(!showErrorTrace);
  };

  const displayNodes = showErrorTrace ? errorTraceNodes : nodes;

  return (
    <div className="App">
      <header className="App-header">
        <h1>システムアーキテクチャダイアグラム</h1>
        <div className="controls">
          <div className="view-level-buttons">
            <button 
              onClick={() => setViewLevel('systemType')}
              className={viewLevel === 'systemType' ? 'active' : ''}
            >
              システムタイプ
            </button>
            <button 
              onClick={() => setViewLevel('systemName')}
              className={viewLevel === 'systemName' ? 'active' : ''}
            >
              システム名
            </button>
            <button 
              onClick={() => setViewLevel('apiPath')}
              className={viewLevel === 'apiPath' ? 'active' : ''}
            >
              APIパス
            </button>
          </div>
          <div className="action-buttons">
            <button 
              onClick={handleToggleErrorTrace}
              className={showErrorTrace ? 'active' : ''}
            >
              {showErrorTrace ? 'すべて表示' : 'エラートレース表示'}
            </button>
            <button onClick={fetchNodes}>
              再読み込み
            </button>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="info-panel">
              <div className="legend">
                <h3>凡例</h3>
                <div className="legend-item">
                  <span className="legend-color sor"></span>
                  <span>SoR (System of Record)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color decoupling"></span>
                  <span>Decoupling Layer</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color soe"></span>
                  <span>SoE (System of Engagement)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color error"></span>
                  <span>エラー発生</span>
                </div>
              </div>
              <div className="stats">
                <h3>統計</h3>
                <p>総ノード数: {displayNodes.length}</p>
                <p>エラー数: {displayNodes.filter(n => n.isError).length}</p>
              </div>
              <div className="view-info">
                <h3>表示レベル</h3>
                <p className="current-level">
                  {viewLevel === 'systemType' && 'システムタイプ別'}
                  {viewLevel === 'systemName' && 'システム名別'}
                  {viewLevel === 'apiPath' && 'APIパス別'}
                </p>
              </div>
            </div>
            
            <SystemDiagram nodes={displayNodes} viewLevel={viewLevel} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
