import React, { useState } from 'react';
import { sallaApi } from '../../services/salla';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Test basic API connection
      const response = await fetch('https://api.salla.dev/v2/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SALLA_ACCESS_TOKEN || 'ory_at_lYvNFw9DAnQqYBXPCgliiqNvaxfzh_haKmMJ5rU0FbQ.b0u0axrl99Bod2_Oy3JrpHItRoYAvKbaelNX8L5jHIw'}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSallaApiClient = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await sallaApi.getProducts({ page: 1, per_page: 5 });
      setResult(`Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`Error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Salla API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Check</h2>
        <p><strong>Base URL:</strong> https://api.salla.dev</p>
        <p><strong>Access Token:</strong> {process.env.NEXT_PUBLIC_SALLA_ACCESS_TOKEN ? 'Set (via NEXT_PUBLIC)' : 'Not set (via NEXT_PUBLIC)'}</p>
        <p><strong>Server Token:</strong> Available on server side</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testApiConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Direct API Call'}
        </button>
        
        <button 
          onClick={testSallaApiClient}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Salla API Client'}
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '15px',
        minHeight: '200px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {result || 'Click a button to test the API connection...'}
      </div>
    </div>
  );
};

export default ApiTest;