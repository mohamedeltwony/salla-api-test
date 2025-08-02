// Salla Webhook Manager
// Configure and manage Salla webhooks for receiving events

import React, { useState, useEffect } from 'react';
import {
  setupAppInstallationWebhook,
  setupWebhook,
  getWebhooks,
  deleteWebhook,
  testWebhook,
  generateWebhookUrl,
  validateWebhookUrl,
  getWebhookSetupInstructions,
  SALLA_WEBHOOK_EVENTS,
  WEBHOOK_PRESETS,
  WebhookConfig,
  WebhookSetupResult
} from '../../services/salla/webhook-setup';
import { SallaWebhook } from '../../services/salla/notifications';

const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<SallaWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof WEBHOOK_PRESETS>('APP_INSTALLATION');
  const [customEvents, setCustomEvents] = useState<string[]>([]);
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customConfig, setCustomConfig] = useState<WebhookConfig>({
    url: '',
    events: [],
    secret: '',
    name: '',
    description: ''
  });

  // Load webhooks
  const loadWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const webhookList = await getWebhooks();
      setWebhooks(webhookList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  // Setup quick webhook
  const handleQuickSetup = async () => {
    if (!baseUrl) {
      setError('Base URL is required');
      return;
    }

    const validation = validateWebhookUrl(baseUrl);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let result: WebhookSetupResult;

      if (selectedPreset === 'APP_INSTALLATION') {
        result = await setupAppInstallationWebhook(baseUrl, webhookSecret);
      } else {
        const preset = WEBHOOK_PRESETS[selectedPreset];
        const config: WebhookConfig = {
          url: generateWebhookUrl(baseUrl, selectedPreset.toLowerCase().replace('_', '-')),
          events: preset.events,
          secret: webhookSecret,
          name: preset.name,
          description: preset.description
        };
        result = await setupWebhook(config);
      }

      if (result.success) {
        setSuccess(result.message);
        await loadWebhooks();
      } else {
        setError(result.error || 'Failed to setup webhook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup webhook');
    } finally {
      setLoading(false);
    }
  };

  // Setup custom webhook
  const handleCustomSetup = async () => {
    if (!customConfig.url || customConfig.events.length === 0) {
      setError('URL and at least one event are required');
      return;
    }

    const validation = validateWebhookUrl(customConfig.url);
    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await setupWebhook(customConfig);

      if (result.success) {
        setSuccess(result.message);
        setShowCustomForm(false);
        setCustomConfig({ url: '', events: [], secret: '', name: '', description: '' });
        await loadWebhooks();
      } else {
        setError(result.error || 'Failed to setup webhook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup webhook');
    } finally {
      setLoading(false);
    }
  };

  // Delete webhook
  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      setError(null);
      const result = await deleteWebhook(webhookId);
      
      if (result.success) {
        setSuccess(result.message);
        await loadWebhooks();
      } else {
        setError(result.error || 'Failed to delete webhook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete webhook');
    }
  };

  // Test webhook
  const handleTestWebhook = async (webhookId: string) => {
    try {
      setError(null);
      const result = await testWebhook(webhookId);
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.error || 'Failed to test webhook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test webhook');
    }
  };

  // Auto-detect base URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const host = window.location.host;
      setBaseUrl(`${protocol}//${host}`);
    }
  }, []);

  useEffect(() => {
    loadWebhooks();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const instructions = baseUrl ? getWebhookSetupInstructions(baseUrl) : null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🔗 Salla Webhook Manager</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Configure and manage webhooks to receive real-time events from Salla stores
        </p>
        
        <button 
          onClick={loadWebhooks}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '10px'
          }}
        >
          🔄 Refresh
        </button>
        
        <button 
          onClick={() => setShowCustomForm(!showCustomForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showCustomForm ? '📋 Quick Setup' : '⚙️ Custom Setup'}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Quick Setup Form */}
      {!showCustomForm && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>⚡ Quick Setup</h2>
          
          <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Base URL:
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://your-domain.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#666' }}>Your application's base URL</small>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Webhook Type:
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as keyof typeof WEBHOOK_PRESETS)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {Object.entries(WEBHOOK_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name} - {preset.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Webhook Secret (Optional):
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Enter webhook secret for signature verification"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#666' }}>Used to verify webhook authenticity</small>
            </div>
          </div>
          
          {baseUrl && selectedPreset && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              <strong>Generated Webhook URL:</strong><br/>
              <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                {selectedPreset === 'APP_INSTALLATION' 
                  ? generateWebhookUrl(baseUrl, 'app-install')
                  : generateWebhookUrl(baseUrl, selectedPreset.toLowerCase().replace('_', '-'))
                }
              </code>
            </div>
          )}
          
          <button
            onClick={handleQuickSetup}
            disabled={loading || !baseUrl}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Setting up...' : '🚀 Setup Webhook'}
          </button>
        </div>
      )}

      {/* Custom Setup Form */}
      {showCustomForm && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>⚙️ Custom Webhook Setup</h2>
          
          <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Webhook URL:
              </label>
              <input
                type="url"
                value={customConfig.url}
                onChange={(e) => setCustomConfig({ ...customConfig, url: e.target.value })}
                placeholder="https://your-domain.com/api/webhooks/salla/custom"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Webhook Name:
              </label>
              <input
                type="text"
                value={customConfig.name}
                onChange={(e) => setCustomConfig({ ...customConfig, name: e.target.value })}
                placeholder="My Custom Webhook"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea
                value={customConfig.description}
                onChange={(e) => setCustomConfig({ ...customConfig, description: e.target.value })}
                placeholder="Description of what this webhook does"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Events:
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px'
              }}>
                {Object.entries(SALLA_WEBHOOK_EVENTS).map(([key, event]) => (
                  <label key={event} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={customConfig.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomConfig({
                            ...customConfig,
                            events: [...customConfig.events, event]
                          });
                        } else {
                          setCustomConfig({
                            ...customConfig,
                            events: customConfig.events.filter(e => e !== event)
                          });
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <code style={{ fontSize: '12px' }}>{event}</code>
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
                      ({key.replace(/_/g, ' ').toLowerCase()})
                    </span>
                  </label>
                ))}
              </div>
              <small style={{ color: '#666' }}>
                Selected: {customConfig.events.length} events
              </small>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Webhook Secret (Optional):
              </label>
              <input
                type="password"
                value={customConfig.secret}
                onChange={(e) => setCustomConfig({ ...customConfig, secret: e.target.value })}
                placeholder="Enter webhook secret for signature verification"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <button
            onClick={handleCustomSetup}
            disabled={loading || !customConfig.url || customConfig.events.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Creating...' : '🚀 Create Webhook'}
          </button>
        </div>
      )}

      {/* Setup Instructions */}
      {instructions && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginTop: 0, color: '#1976d2' }}>📋 Setup Instructions</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>App Installation Webhook URL:</strong><br/>
            <code style={{ fontSize: '12px', wordBreak: 'break-all', backgroundColor: 'white', padding: '5px', borderRadius: '3px' }}>
              {instructions.appInstallUrl}
            </code>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Steps:</strong>
            <ol style={{ marginTop: '5px', paddingLeft: '20px' }}>
              {instructions.steps.map((step, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{step}</li>
              ))}
            </ol>
          </div>
          
          <div>
            <strong>Important Notes:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              {instructions.notes.map((note, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Existing Webhooks */}
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
          <h2 style={{ margin: 0, color: '#333' }}>🔗 Configured Webhooks</h2>
        </div>
        
        {loading && webhooks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '18px' }}>Loading webhooks...</div>
          </div>
        ) : webhooks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔗</div>
            <h3>No webhooks configured</h3>
            <p>Set up your first webhook using the form above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>URL</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Events</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((webhook) => (
                  <tr key={webhook.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <strong>{webhook.name || 'Unnamed Webhook'}</strong>
                        {webhook.description && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            {webhook.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                        {webhook.url}
                      </code>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '11px' }}>
                        {webhook.events.slice(0, 3).map(event => (
                          <div key={event} style={{ marginBottom: '2px' }}>
                            <code>{event}</code>
                          </div>
                        ))}
                        {webhook.events.length > 3 && (
                          <div style={{ color: '#666' }}>+{webhook.events.length - 3} more</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: webhook.active ? '#d4edda' : '#f8d7da',
                        color: webhook.active ? '#155724' : '#721c24'
                      }}>
                        {webhook.active ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleTestWebhook(webhook.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🧪 Test
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
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
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookManager;