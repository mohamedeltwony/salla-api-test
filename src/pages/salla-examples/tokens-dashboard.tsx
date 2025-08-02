// Salla Tokens Dashboard
// View and manage authentication tokens received from app installations

import React, { useState, useEffect } from 'react';
import { sallaTokenManager, MerchantTokenData } from '../../services/salla/token-manager';

interface TokenSummary {
  total: number;
  active: number;
  expired: number;
  merchants: Array<{
    merchantId: string;
    merchantName: string;
    isActive: boolean;
    expiresAt?: Date;
    timeUntilExpiry?: string;
  }>;
}

const TokensDashboard: React.FC = () => {
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [tokens, setTokens] = useState<MerchantTokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<MerchantTokenData | null>(null);

  // Load token data
  const loadTokenData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get summary and all tokens
      const [summaryData, allTokens] = await Promise.all([
        sallaTokenManager.getTokenSummary(),
        sallaTokenManager.getAllTokens()
      ]);
      
      setSummary(summaryData);
      setTokens(allTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load token data');
    } finally {
      setLoading(false);
    }
  };

  // Remove a token
  const handleRemoveToken = async (merchantId: string) => {
    if (!confirm(`Are you sure you want to remove the token for merchant ${merchantId}?`)) {
      return;
    }
    
    try {
      await sallaTokenManager.removeToken(merchantId);
      await loadTokenData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove token');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Copy token to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    loadTokenData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🔑 Salla Tokens Dashboard</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px' }}>Loading token data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🔑 Salla Tokens Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Manage authentication tokens received from Salla app installations
        </p>
        
        <button 
          onClick={loadTokenData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #bbdefb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📊 Total Merchants</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {summary.total}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#e8f5e8',
            border: '1px solid #c8e6c9',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>✅ Active Tokens</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              {summary.active}
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#fff3e0',
            border: '1px solid #ffcc02',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>⏰ Expired Tokens</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {summary.expired}
            </div>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>🏪 Merchant Tokens</h2>
        </div>
        
        {tokens.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            <h3>No tokens found</h3>
            <p>No authentication tokens have been received yet.</p>
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              textAlign: 'left'
            }}>
              <strong>To receive tokens:</strong>
              <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>Configure your webhook URL in Salla Developer Portal</li>
                <li>Set webhook URL to: <code>https://your-domain.com/api/webhooks/salla/app-install</code></li>
                <li>Install your app to a Salla store</li>
                <li>The authentication token will appear here automatically</li>
              </ol>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Merchant</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Domain</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Installed</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Expires</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => {
                  const merchantSummary = summary?.merchants.find(m => m.merchantId === token.merchantId);
                  const isActive = merchantSummary?.isActive ?? false;
                  
                  return (
                    <tr key={token.merchantId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <strong>{token.merchantName}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {token.merchantId}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: isActive ? '#d4edda' : '#f8d7da',
                          color: isActive ? '#155724' : '#721c24'
                        }}>
                          {isActive ? '✅ Active' : '❌ Expired'}
                        </span>
                        {merchantSummary?.timeUntilExpiry && (
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            Expires in {merchantSummary.timeUntilExpiry}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <a 
                          href={`https://${token.merchantDomain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#007bff', textDecoration: 'none' }}
                        >
                          {token.merchantDomain}
                        </a>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                        {formatDate(token.installedAt)}
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                        {merchantSummary?.expiresAt ? formatDate(merchantSummary.expiresAt.toISOString()) : 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedToken(token)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleRemoveToken(token.merchantId)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Token Details Modal */}
      {selectedToken && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>🔑 Token Details</h2>
              <button
                onClick={() => setSelectedToken(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <strong>Merchant Name:</strong> {selectedToken.merchantName}
              </div>
              <div>
                <strong>Merchant ID:</strong> {selectedToken.merchantId}
              </div>
              <div>
                <strong>Domain:</strong> 
                <a href={`https://${selectedToken.merchantDomain}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#007bff' }}>
                  {selectedToken.merchantDomain}
                </a>
              </div>
              <div>
                <strong>Email:</strong> {selectedToken.merchantEmail}
              </div>
              <div>
                <strong>Currency:</strong> {selectedToken.currency}
              </div>
              <div>
                <strong>Timezone:</strong> {selectedToken.timezone}
              </div>
              <div>
                <strong>Scope:</strong> {selectedToken.scope}
              </div>
              <div>
                <strong>Token Type:</strong> {selectedToken.tokenType}
              </div>
              <div>
                <strong>Expires In:</strong> {selectedToken.expiresIn} seconds
              </div>
              <div>
                <strong>Installed At:</strong> {formatDate(selectedToken.installedAt)}
              </div>
              <div>
                <strong>Updated At:</strong> {formatDate(selectedToken.updatedAt)}
              </div>
              <div>
                <strong>Access Token:</strong>
                <div style={{ 
                  marginTop: '5px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  position: 'relative'
                }}>
                  {selectedToken.accessToken}
                  <button
                    onClick={() => copyToClipboard(selectedToken.accessToken)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      padding: '4px 8px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              {selectedToken.refreshToken && (
                <div>
                  <strong>Refresh Token:</strong>
                  <div style={{ 
                    marginTop: '5px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    position: 'relative'
                  }}>
                    {selectedToken.refreshToken}
                    <button
                      onClick={() => copyToClipboard(selectedToken.refreshToken!)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        padding: '4px 8px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokensDashboard;