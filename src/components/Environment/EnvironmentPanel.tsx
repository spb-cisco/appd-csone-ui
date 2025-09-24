import React, { useState, useEffect } from 'react';
import { Button } from '@magnetic/button';
import { Text } from '@magnetic/text';
import { Heading } from '@magnetic/heading';
import { Link } from '@magnetic/link';
import { Input } from "@magnetic/input";
import { Card } from '@magnetic/card';
import { Flex } from "@magnetic/flex";
import { Container } from "@magnetic/container";
import { Table } from "@magnetic/table";
import { Tabs } from "@magnetic/tabs";
import { BarChart } from "@magnetic/charts";
import { Tooltip } from "@magnetic/tooltip";
import { KeyValue } from "@magnetic/key-value";
import { FileArrowDown, Info, Atom, WarningOctagon, Warning, Code, PlusSquare, MinusSquare, CheckCircle, XCircle, Stack, Equalizer } from "@magnetic/icons";
import './EnvironmentPanel.css';

interface IncidentData {
  controller: Array<{
    id: string;
    type: string;
    description: string;
    startTime: string;
    endTime: string;
    duration: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'resolved';
    resourceType: 'heap' | 'cpu' | 'memory' | 'disk' | 'network';
  }>;
  account: Array<{
    id: string;
    type: string;
    description: string;
    startTime: string;
    endTime: string;
    duration: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'resolved';
  }>;
  cluster: Array<{
    id: string;
    type: string;
    description: string;
    startTime: string;
    endTime: string;
    duration: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'resolved';
  }>;
}

interface ControllerOption {
  id: string;
  name: string;
  hostname: string;
  accountId: string;
  data: EnvironmentData;
}

interface EnvironmentData {
  accountInfo: {
    controller: string;
    accountId: string;
    host: string;
    sshIp: string;
    version: string;
    globalName: string;
    eumName: string;
    dedicated: boolean;
    license: string;
  };
  settings: {
    timezone: string;
    retention: string;
    maintWindow: string;
    sso: boolean;
  };
  limits: {
    applications: number;
    agents: number;
    dbCollectors: number;
    eumApps: number;
  };
  jiras: Array<{
    id: string;
    title: string;
    priority: 'P0' | 'P1' | 'P2';
    status: 'open' | 'in-progress' | 'resolved';
  }>;
  clusters: {
    gan: string[];
    eum: string[];
  };
  healthStatus: 'healthy' | 'warning' | 'critical';
  metrics: {
    uptime: number;
    responseTime: number;
    activeUsers: number;
    errorRate: number;
    threadPoolBreach: number;
    limitsReached: number;
  };
  incidents: IncidentData;
}

interface QueryParameter {
  name: string;
  type: 'string' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface PredefinedQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  parameters: QueryParameter[];
}

interface QueryResult {
  columns: string[];
  rows: (string | number)[][];
}

interface EnvironmentPanelProps {
  data?: EnvironmentData;
  availableControllers?: ControllerOption[];
  onControllerChange?: (controllerId: string) => void;
}

const predefinedQueries: PredefinedQuery[] = [
  {
    id: 'active-applications',
    name: 'Active Applications',
    description: 'Get all active applications in the account',
    query: 'SELECT app_name, app_id, created_date FROM applications WHERE status = \'active\'',
    parameters: []
  },
  {
    id: 'top-errors-by-app',
    name: 'Top Errors by Application',
    description: 'Get top errors for a specific application within date range',
    query: 'SELECT error_message, error_count, first_occurred FROM error_logs WHERE app_id = ? AND date >= ? AND date <= ? ORDER BY error_count DESC LIMIT ?',
    parameters: [
      { name: 'appId', type: 'string', label: 'Application ID', placeholder: 'Enter application ID', required: true },
      { name: 'startDate', type: 'date', label: 'Start Date', required: true },
      { name: 'endDate', type: 'date', label: 'End Date', required: true },
      { name: 'limit', type: 'number', label: 'Limit', placeholder: '10', required: false }
    ]
  },
  {
    id: 'agent-status',
    name: 'Agent Status Report',
    description: 'Get status of all agents for a specific application',
    query: 'SELECT agent_name, agent_type, status, last_checkin FROM agents WHERE app_name = ? ORDER BY last_checkin DESC',
    parameters: [
      { name: 'appName', type: 'string', label: 'Application Name', placeholder: 'Enter application name', required: true }
    ]
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Get performance metrics for a specific time range',
    query: 'SELECT timestamp, avg_response_time, throughput, error_rate FROM performance_metrics WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp',
    parameters: [
      { name: 'startTime', type: 'date', label: 'Start Time', required: true },
      { name: 'endTime', type: 'date', label: 'End Time', required: true }
    ]
  },
  {
    id: 'database-connections',
    name: 'Database Connections',
    description: 'Monitor database connections and their status',
    query: 'SELECT db_name, connection_count, active_connections, max_connections FROM database_stats WHERE db_name LIKE ?',
    parameters: [
      { name: 'dbPattern', type: 'string', label: 'Database Name Pattern', placeholder: '%prod%', required: true }
    ]
  }
];

const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({ 
  data,
  availableControllers = [
    {
      id: 'controllerces',
      name: 'Controller CES',
      hostname: 'controllerces.saas.appdynamics.com',
      accountId: '55 ( controllerces )',
      data: {
        accountInfo: {
          controller: 'controllerces.saas.appdynamics.com',
          accountId: '55 ( controllerces )',
          host: 'pdx-p-con-1001',
          sshIp: '10.1.2.3',
          version: '23.9.1',
          globalName: 'controllerces',
          eumName: '-',
          dedicated: false,
          license: 'a0Q2H00000Ery2BUAR'
        },
        settings: { timezone: 'UTC', retention: '30 days', maintWindow: 'Sun 02:00–04:00 UTC', sso: true },
        limits: { applications: 100, agents: 500, dbCollectors: 20, eumApps: 10 },
        jiras: [
          { id: 'JIRA-12345', title: 'Login authentication timeout', priority: 'P1', status: 'open' },
          { id: 'JIRA-12346', title: 'Database connection issues', priority: 'P0', status: 'in-progress' },
          { id: 'JIRA-12347', title: 'Memory leak in agent', priority: 'P1', status: 'open' }
        ],
        clusters: { gan: ['athena'], eum: ['pdx-p01-dyn-k8s-a1-dis3'] },
        healthStatus: 'healthy',
        metrics: { uptime: 99.97, responseTime: 245, activeUsers: 1247, errorRate: 0.02, threadPoolBreach: 2, limitsReached: 3 },
        incidents: {
          controller: [
            {
              id: 'CTRL-INC-001',
              type: 'ContrResourceUsageInc',
              description: 'Increase in usage percent % on Controller resources like Heap, CPU etc',
              startTime: '09/09/2025 07:02:01',
              endTime: '07:25:01',
              duration: '0h 23m 0s',
              severity: 'warning',
              status: 'resolved',
              resourceType: 'heap'
            }
          ],
          account: [],
          cluster: []
        }
      }
    },
    {
      id: 'dotnetces',
      name: 'DotNet CES',
      hostname: 'dotnetces.saas.appdynamics.com',
      accountId: '789012',
      data: {
        accountInfo: {
          controller: 'dotnetces.saas.appdynamics.com',
          accountId: '789012',
          host: 'pdx-p-con-208',
          sshIp: '10.1.2.4',
          version: '23.9.2',
          globalName: 'dotnetces',
          eumName: 'eum-dotnetces',
          dedicated: true,
          license: 'Enterprise / 1000 Agents'
        },
        settings: { timezone: 'PST', retention: '45 days', maintWindow: 'Sat 01:00–03:00 PST', sso: true },
        limits: { applications: 150, agents: 800, dbCollectors: 30, eumApps: 15 },
        jiras: [
          { id: 'JIRA-22345', title: 'Memory optimization needed', priority: 'P2', status: 'open' },
          { id: 'JIRA-22346', title: 'SSL certificate renewal', priority: 'P1', status: 'resolved' }
        ],
        clusters: { gan: ['eks3', 'eks4'], eum: ['pdx-p01-dyn-k8s-a1-dis3'] },
        healthStatus: 'warning',
        metrics: { uptime: 99.85, responseTime: 180, activeUsers: 2847, errorRate: 0.15, threadPoolBreach: 5, limitsReached: 1 },
        incidents: {
          controller: [
            {
              id: 'CTRL-INC-002',
              type: 'ContrResourceUsageInc',
              description: 'Memory leak detected in controller process',
              startTime: '09/09/2025 14:15:30',
              endTime: '16:45:12',
              duration: '2h 29m 42s',
              severity: 'critical',
              status: 'active',
              resourceType: 'memory'
            }
          ],
          account: [],
          cluster: []
        }
      }
    },
    {
      id: 'farm',
      name: 'Farm Controller',
      hostname: 'farm.saas.appdynamics.com',
      accountId: '345678',
      data: {
        accountInfo: {
          controller: 'farm.saas.appdynamics.com',
          accountId: '345678',
          host: 'pdx-p-con-209',
          sshIp: '10.161.178.89',
          version: '23.8.9',
          globalName: 'farm',
          eumName: 'eum-farm',
          dedicated: false,
          license: 'a0Q2H00000Ery2BUAR'
        },
        settings: { timezone: 'EST', retention: '15 days', maintWindow: 'Sun 03:00–05:00 EST', sso: false },
        limits: { applications: 50, agents: 200, dbCollectors: 10, eumApps: 5 },
        jiras: [
          { id: 'JIRA-32345', title: 'Performance degradation', priority: 'P0', status: 'in-progress' },
          { id: 'JIRA-32346', title: 'Agent connectivity issues', priority: 'P0', status: 'open' },
          { id: 'JIRA-32347', title: 'Database timeout errors', priority: 'P1', status: 'open' }
        ],
        clusters: { gan: ['eks5'], eum: ['eum-eks5'] },
        healthStatus: 'critical',
        metrics: { uptime: 97.2, responseTime: 890, activeUsers: 567, errorRate: 2.8, threadPoolBreach: 12, limitsReached: 7 },
        incidents: {
          controller: [
            {
              id: 'CTRL-INC-003',
              type: 'ContrResourceUsageInc', 
              description: 'High CPU usage affecting performance',
              startTime: '09/09/2025 09:30:15',
              endTime: '12:15:22',
              duration: '2h 45m 7s',
              severity: 'critical',
              status: 'active',
              resourceType: 'cpu'
            },
            {
              id: 'CTRL-INC-004',
              type: 'ContrResourceUsageInc',
              description: 'Disk space utilization above threshold',
              startTime: '09/08/2025 18:20:00',
              endTime: '22:10:30',
              duration: '3h 50m 30s',
              severity: 'warning',
              status: 'resolved',
              resourceType: 'disk'
            }
          ],
          account: [],
          cluster: []
        }
      }
    }
  ],
  onControllerChange
}) => {
  const [selectedControllerId, setSelectedControllerId] = useState(
    data?.accountInfo?.controller ||
    availableControllers[0]?.id ||
    ''
  );
  const [autocompleteValue, setAutocompleteValue] = useState(
    data?.accountInfo?.controller ||
    availableControllers[0]?.hostname ||
    ''
  );
  const [activeView, setActiveView] = useState<'overview' | 'issues' | 'incidents' | 'limits' | 'executeQuery'>('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [collapsedIncidents, setCollapsedIncidents] = useState<{[key: string]: boolean}>({});
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);

  // Query execution state
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [queryParameters, setQueryParameters] = useState<{[key: string]: string}>({});
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string>('');

  const toggleIncident = (incidentKey: string) => {
    setCollapsedIncidents(prev => ({
      ...prev,
      [incidentKey]: !prev[incidentKey]
    }));
  };

  // Get current data - either from props, selected controller, or default
  const currentData = data || 
    availableControllers.find(c => c.id === selectedControllerId)?.data || 
    availableControllers[0]?.data;

  // Handle controller selection
  const handleControllerSelect = (controllerId: string) => {
    setSelectedControllerId(controllerId);
    if (onControllerChange) {
      onControllerChange(controllerId);
    }
  };

  // Safety check for currentData
  if (!currentData) {
    return (
      <Container>
        <Text>No controller data available</Text>
      </Container>
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Set default controller on mount
  useEffect(() => {
    if (availableControllers.length > 0 && !selectedControllerId) {
      const defaultController = availableControllers[0];
      setSelectedControllerId(defaultController.id);
      setAutocompleteValue(defaultController.hostname);
      if (onControllerChange) {
        onControllerChange(defaultController.id);
      }
    }
  }, [availableControllers, selectedControllerId, onControllerChange]);

//   const getHealthStatus = (health: string) => {
//     switch (health) {
//       case 'healthy': return 'OPERATIONAL';
//       case 'warning': return 'DEGRADED';
//       case 'critical': return 'CRITICAL';
//       default: return 'UNKNOWN';
//     }
//   };

//   const getStatusColor = (health: string) => {
//     switch (health) {
//       case 'healthy': return '#00c851';
//       case 'warning': return '#ff9800';  
//       case 'critical': return '#ff4444';
//       default: return '#6c757d';
//     }
//   };
//   const getStatus = (health: string) => {
//     switch (health) {
//       case 'healthy': return 'positive';
//       case 'warning': return 'warning';  
//       case 'critical': return 'negative';
//       default: return 'positive';
//     }
//   };

  // Query execution function
  const executeQuery = async () => {
    if (!selectedQuery) return;
    
    setIsExecuting(true);
    setQueryError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const query = predefinedQueries.find(q => q.id === selectedQuery);
      if (!query) throw new Error('Query not found');
      
      // Generate mock results based on query type
      let mockResults: QueryResult;
      
      switch (selectedQuery) {
        case 'active-applications':
          mockResults = {
            columns: ['App Name', 'App ID', 'Created Date'],
            rows: [
              ['E-Commerce Web', 'app-001', '2023-01-15'],
              ['Mobile API', 'app-002', '2023-02-20'],
              ['Payment Service', 'app-003', '2023-03-10'],
              ['User Management', 'app-004', '2023-04-05']
            ]
          };
          break;
          
        case 'top-errors-by-app':
          mockResults = {
            columns: ['Error Message', 'Error Count', 'First Occurred'],
            rows: [
              ['NullPointerException in UserService', 245, '2025-09-20 10:30:00'],
              ['Database connection timeout', 156, '2025-09-21 14:15:00'],
              ['Invalid session token', 89, '2025-09-22 09:45:00'],
              ['Memory allocation failed', 34, '2025-09-23 16:20:00']
            ]
          };
          break;
          
        case 'agent-status':
          mockResults = {
            columns: ['Agent Name', 'Agent Type', 'Status', 'Last Checkin'],
            rows: [
              ['web-agent-01', 'Java', 'Active', '2025-09-25 12:30:00'],
              ['app-agent-02', '.NET', 'Active', '2025-09-25 12:29:00'],
              ['db-agent-03', 'Database', 'Inactive', '2025-09-25 11:45:00'],
              ['mobile-agent-04', 'iOS', 'Active', '2025-09-25 12:31:00']
            ]
          };
          break;
          
        case 'performance-metrics':
          mockResults = {
            columns: ['Timestamp', 'Avg Response Time (ms)', 'Throughput (rpm)', 'Error Rate (%)'],
            rows: [
              ['2025-09-25 12:00:00', 250, 1500, 0.5],
              ['2025-09-25 12:15:00', 280, 1450, 0.8],
              ['2025-09-25 12:30:00', 220, 1600, 0.3],
              ['2025-09-25 12:45:00', 300, 1400, 1.2]
            ]
          };
          break;
          
        case 'database-connections':
          mockResults = {
            columns: ['DB Name', 'Connection Count', 'Active Connections', 'Max Connections'],
            rows: [
              ['prod-users-db', 45, 38, 100],
              ['prod-orders-db', 62, 55, 150],
              ['prod-inventory-db', 23, 18, 80],
              ['prod-analytics-db', 15, 12, 50]
            ]
          };
          break;
          
        default:
          mockResults = {
            columns: ['Result'],
            rows: [['No data available']]
          };
      }
      
      setQueryResults(mockResults);
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : 'An error occurred while executing the query');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Container className="modern-environment-panel">
      <Flex direction="vertical" gap={24}>
        <Flex direction="horizontal" align="center" justify="space-between">
          <Flex direction="horizontal" align="center" gap={12}>
            <Tooltip title={isPanelCollapsed ? "Expand Panel" : "Collapse Panel"}>
              <Button
                icon={isPanelCollapsed ? <PlusSquare size={20} weight="bold" color="#054bf0"/> : <MinusSquare size={20} weight="bold" color="#054bf0"/>}
                kind="tertiary"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                style={{ minWidth: '40px' }}
              />
            </Tooltip>
            <Heading size="section">
              SaaS Controller Information
            </Heading>
          </Flex>
        </Flex>
        
        {!isPanelCollapsed && (
          <>
        {/* Hero Status Section */}
        <Container>
       <Card className="hero-status-card" >
          <Flex direction="vertical" gap={16}>
            <Flex direction="horizontal" align="flex-start" justify="space-between" gap={24}>
              {/* Left Side - Controller Input and Info */}
              <Flex direction="vertical" gap={24} style={{ flex: 1, maxWidth: '50%' }}>
                <Flex direction="horizontal" align="center" gap={16} id="input-controller">
                  <Input.Autocomplete style={{ minWidth: '500px' }}
                    hiddenLabel
                    label="Controller Selection"
                    placeholder="Enter Host name or Controller account name"
                    value={autocompleteValue}
                    onChange={(value) => {
                      if (typeof value === 'string') {
                        setAutocompleteValue(value);
                      } else {
                        setAutocompleteValue(value.target.value);
                      }
                    }}
                    onClear={() => setAutocompleteValue('')}
                    options={availableControllers.map(controller => controller.hostname)}
                  />
                
                  <Button 
                    type="submit" 
                    variant="primary"
                    onClick={() => {
                      if (autocompleteValue.trim()) {
                        // Check if it's a predefined controller
                        const controller = availableControllers.find(c => 
                          c.hostname === autocompleteValue || 
                          c.name.toLowerCase().includes(autocompleteValue.toLowerCase())
                        );
                        if (controller) {
                          handleControllerSelect(controller.id);
                          setAutocompleteValue(controller.hostname); // Update display
                        } else {
                          // Handle custom controller - for now just log
                          console.log('Loading custom controller:', autocompleteValue);
                          // In a real app, this would trigger an API call
                        }
                      }
                    }}
                  >
                    Submit
                  </Button>
                </Flex>
                
                <Flex direction="vertical" gap={8} id="controller-hero-info">
                  <Flex direction="horizontal" align="center" gap={8}>
                    <Heading size="section" className="controller-title">
                      {currentData.accountInfo.globalName}
                    </Heading>
                    <Tooltip title="Download Controller Settings File">
                    <Link href="#" onClick={(e) => {
                      e.preventDefault();
                      // Add download functionality here
                      console.log('Download triggered for controller:', currentData.accountInfo.globalName);
                    }}>
                      <FileArrowDown size="small" style={{ fontWeight: 'bold', color: 'var(--interact-icon-weak-default)', width: '20px', height: '20px' }} />
                    </Link>
                    </Tooltip>
                  </Flex>
                  <Link href={`https://${currentData.accountInfo.controller}`} target="_blank" rel="noopener">
                    {currentData.accountInfo.controller}
                  </Link>
                  <Text color="light" size="p3">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </Text>
                </Flex>
              </Flex>

              {/* Right Side - Key Metrics Display - Small Cards */}
              <Flex direction="horizontal" gap={12} align="flex-start" wrap style={{ flex: 1, maxWidth: '50%' }} id="key-metrics-cards">
                {/* Uptime Card */}
                <Card 
                  accent={currentData.metrics.uptime >= 99.5 ? "excellent" : currentData.metrics.uptime >= 95 ? "warning" : "negative"} 
                  style={{ width: 200, cursor: 'pointer' }}
                  onClick={() => console.log('Uptime clicked')}
                >
                  <Flex align="center" direction="horizontal" justify="space-between">
                    <Flex align="flex-end" direction="horizontal" gap={4}>
                      <Text size="p1" weight="semi-bold">
                        {currentData.metrics.uptime}%
                      </Text>
                      <Text size="p4" weight="semi-bold">
                        Uptime
                      </Text>
                    </Flex>
                    <Flex align="flex-end">
                      <CheckCircle 
                        style={{ 
                          color: currentData.metrics.uptime >= 99.5 ? '#28a745' : currentData.metrics.uptime >= 95 ? '#ffc107' : '#dc3545',
                          fontSize: '20px'
                        }} 
                      />
                    </Flex>
                  </Flex>
                </Card>

                {/* Active Incidents Card */}
                <Card 
                  accent={(() => {
                    const totalIncidents = currentData.incidents.controller.length + currentData.incidents.account.length + currentData.incidents.cluster.length;
                    const criticalIncidents = [...currentData.incidents.controller, ...currentData.incidents.account, ...currentData.incidents.cluster]
                      .filter((incident: any) => incident.severity === 'critical').length;
                    return criticalIncidents > 0 ? "negative" : totalIncidents > 0 ? "warning" : "excellent";
                  })()} 
                  style={{ width: 200, cursor: 'pointer' }}
                  onClick={() => setActiveView('incidents')}
                >
                  <Flex align="center" direction="horizontal" justify="space-between">
                    <Flex align="flex-end" direction="horizontal" gap={4}>
                      <Text size="p1" weight="semi-bold">
                        {currentData.incidents.controller.length + currentData.incidents.account.length + currentData.incidents.cluster.length}
                      </Text>
                      <Text size="p4" weight="semi-bold">
                        Incidents
                      </Text>
                    </Flex>
                    <Flex align="flex-end">
                      {(() => {
                        const totalIncidents = currentData.incidents.controller.length + currentData.incidents.account.length + currentData.incidents.cluster.length;
                        const criticalIncidents = [...currentData.incidents.controller, ...currentData.incidents.account, ...currentData.incidents.cluster]
                          .filter((incident: any) => incident.severity === 'critical').length;
                        
                        if (totalIncidents === 0) {
                          return <CheckCircle style={{ color: '#28a745', fontSize: '20px' }} />;
                        } else if (criticalIncidents > 0) {
                          return <XCircle style={{ color: '#dc3545', fontSize: '20px' }} />;
                        } else {
                          return <Warning style={{ color: '#ffc107', fontSize: '20px' }} />;
                        }
                      })()}
                    </Flex>
                  </Flex>
                </Card>

                {/* P0/P1 Issues Card */}
                <Card 
                  accent={(() => {
                    const p0Issues = currentData.jiras.filter((jira: any) => jira.priority === 'P0').length;
                    const p1Issues = currentData.jiras.filter((jira: any) => jira.priority === 'P1').length;
                    return p0Issues > 0 ? "negative" : p1Issues > 0 ? "warning" : "excellent";
                  })()} 
                  style={{ width: 200, cursor: 'pointer' }}
                  onClick={() => setActiveView('issues')}
                >
                  <Flex align="center" direction="horizontal" justify="space-between">
                    <Flex align="flex-end" direction="horizontal" gap={4}>
                      <Text size="p1" weight="semi-bold">
                        {currentData.jiras.filter((jira: any) => jira.priority === 'P0' || jira.priority === 'P1').length}
                      </Text>
                      <Text size="p4" weight="semi-bold">
                        P0/P1 Issues
                      </Text>
                    </Flex>
                    <Flex align="flex-end">
                      {(() => {
                        const p0Issues = currentData.jiras.filter((jira: any) => jira.priority === 'P0').length;
                        const p1Issues = currentData.jiras.filter((jira: any) => jira.priority === 'P1').length;
                        
                        if (p0Issues > 0) {
                          return <XCircle style={{ color: '#dc3545', fontSize: '20px' }} />;
                        } else if (p1Issues > 0) {
                          return <Warning style={{ color: '#ffc107', fontSize: '20px' }} />;
                        } else {
                          return <CheckCircle style={{ color: '#28a745', fontSize: '20px' }} />;
                        }
                      })()}
                    </Flex>
                  </Flex>
                </Card>

                {/* Thread Pool % Card */}
                <Card 
                  accent={currentData.metrics.threadPoolBreach === 0 ? "excellent" : currentData.metrics.threadPoolBreach <= 0 ? "warning" : "negative"} 
                  style={{ width: 200, cursor: 'pointer' }}
                  onClick={() => console.log('Thread Pool clicked')}
                >
                  <Flex align="center" direction="horizontal" justify="space-between">
                    <Flex align="flex-end" direction="horizontal" gap={4}>
                      <Text size="p1" weight="semi-bold">
                        {currentData.metrics.threadPoolBreach}
                      </Text>
                      <Text size="p4" weight="semi-bold">
                        Thread Pool Breaches
                      </Text>
                    </Flex>
                    <Flex align="flex-end">
                      <Stack style={{ color: currentData.metrics.threadPoolBreach === 0 ? '#28a745' : currentData.metrics.threadPoolBreach <= 5 ? '#ffc107' : '#dc3545', fontSize: '20px' }} />
                    </Flex>
                  </Flex>
                </Card>

                {/* Limits Card */}
                <Card 
                  accent={currentData.metrics.limitsReached === 0 ? "excellent" : currentData.metrics.limitsReached <= 3 ? "warning" : "negative"} 
                  style={{ width: 200, cursor: 'pointer' }}
                  onClick={() => setActiveView('limits')}
                >
                  <Flex align="center" direction="horizontal" justify="space-between">
                    <Flex align="flex-end" direction="horizontal" gap={4}>
                      <Text size="p1" weight="semi-bold">
                        {currentData.metrics.limitsReached}
                      </Text>
                      <Text size="p4" weight="semi-bold">
                        Metric Limits Reached
                      </Text>
                    </Flex>
                    <Flex align="flex-end">
                      <Equalizer style={{ color: currentData.metrics.limitsReached === 0 ? '#28a745' : currentData.metrics.limitsReached <= 3 ? '#ffc107' : '#dc3545', fontSize: '20px' }} />
                    </Flex>
                  </Flex>
                </Card>

              </Flex>
            </Flex>

          </Flex>
        </Card>
        </Container>
        
        {/* Interactive Data Section with Tabs */}
        <Container>
            
            <Flex direction="vertical" gap={16}>
                
                <Tabs kind="secondary">
                <Tabs.Link 
                    selected={activeView === 'overview'} 
                    prefix={<Info color="#1d69cc"/>}
                    onClick={() => setActiveView('overview')}
                >
                    Details
                </Tabs.Link>
                <Tabs.Link 
                    selected={activeView === 'limits'} 
                    prefix={<Atom color="#1dcc29ff"/>}
                    onClick={() => setActiveView('limits')}
                >
                    Limits
                </Tabs.Link>
                <Tabs.Link 
                    selected={activeView === 'issues'} 
                    prefix={<Warning color="#ffdf6b"/>}
                    onClick={() => setActiveView('issues')}
                >
                    Issues
                </Tabs.Link>
                <Tabs.Link 
                    selected={activeView === 'incidents'} 
                    prefix={<WarningOctagon color="#ea0b0b"/>}
                    onClick={() => setActiveView('incidents')}
                >
                    Incidents
                </Tabs.Link>
                <Tabs.Link 
                    selected={activeView === 'executeQuery'} 
                    prefix={<Code color="#6f42c1"/>}
                    onClick={() => setActiveView('executeQuery')}
                >
                    Execute Query
                </Tabs.Link>
                
                </Tabs>

                {activeView === 'overview' && (
                <Container>
                    <Flex justify='flex-end'>
                        <KeyValue placement="beside" alignment="right" style={{width:"100%"}} size="md">
                        <KeyValue.Group >
                            <KeyValue.Pair 
                            pair={[
                                'Controller Version',
                                'Controller v25.1.3.0 Build 25.1.3-1387'
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Controller Host',
                                currentData.accountInfo.host
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Node (Host) IP(s)',
                                <Link   href={`ssh://admin@${currentData.accountInfo.sshIp}`}>{currentData.accountInfo.sshIp}</Link>
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Premium Accounts',
                                '-'
                            ]}
                            />
                            
                        </KeyValue.Group>
                        <KeyValue.Divider />
                        <KeyValue.Group>
                            <KeyValue.Pair
                            pair={[
                                'Blitz Cluster',
                                currentData.clusters.gan.join(', ')
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'DIS Cluster',
                                currentData.clusters.eum.join(', ')
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Account ID (Name)',
                                <Link  href={`https://${currentData.accountInfo.controller}/controller/#/admin/account/${currentData.accountInfo.accountId}`}>
                                {`${currentData.accountInfo.accountId} (${currentData.accountInfo.globalName})`}
                                </Link>
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'License Info',
                                <Link href={`https://${currentData.accountInfo.controller}/controller/#/admin/license`}>
                                {currentData.accountInfo.license}
                                </Link>
                            ]}
                            />
                            
                        </KeyValue.Group>
                        <KeyValue.Divider />
                        <KeyValue.Group>
                            
                            <KeyValue.Pair
                            pair={[
                                'Global Account Name',
                                currentData.accountInfo.globalName
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Eum Account Name',
                                currentData.accountInfo.eumName
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Is Premium Account?',
                                currentData.accountInfo.license.includes('Premium') ? 'Yes' : 'No'
                            ]}
                            />
                            <KeyValue.Pair
                            pair={[
                                'Is Dedicated Controller?',
                                currentData.accountInfo.dedicated ? 'Yes' : 'No'
                            ]}
                            />
                        </KeyValue.Group>
                        </KeyValue>
                    
                    </Flex>
                </Container>
                )}

                {activeView === 'issues' && (
                <Container>
                    <Flex direction="vertical" gap={12}>
                    <Flex direction="horizontal" align="center" justify="space-between">
                        <Heading size="sub-section">Active Issues</Heading>
                        <Text size="p3" style={{ color: '#007bff' }}>
                        {currentData.jiras.length} total issues
                        </Text>
                    </Flex>
                    <Table
                        columns={[
                        { 
                            accessorKey: 'id', 
                            header: 'Issue ID',
                            cell: (props) => <Link href={`#${props.row.original.id}`}>{props.row.original.id}</Link>
                        },
                        { accessorKey: 'title', header: 'Title' },
                        { accessorKey: 'priority', header: 'Priority' },
                        { accessorKey: 'status', header: 'Status' }
                        ]}
                        data={currentData.jiras.map(jira => ({
                        id: jira.id,
                        title: jira.title,
                        priority: jira.priority,
                        status: jira.status
                        }))}
                    />
                    
                    </Flex>
                </Container>
                )}

                {activeView === 'incidents' && (
                <Container>
                    <Flex direction="vertical" gap={16}>
                    <Heading size="sub-section">Active Incidents</Heading>
                    
                    {/* Controller Level Incidents */}
                    <Flex direction="vertical" gap={12}>
                        <Text size="p1" weight="bold">Controller Level</Text>
                        {currentData.incidents.controller.length > 0 ? (
                        currentData.incidents.controller.map((incident: any, index: number) => {
                            const incidentKey = `controller-${index}`;
                            const isCollapsed = collapsedIncidents[incidentKey] !== false;
                            
                            return (
                            <Card key={incidentKey} style={{ 
                                border: `1px solid ${incident.severity === 'critical' ? '#dc3545' : incident.severity === 'warning' ? '#ffc107' : '#007bff'}`,
                                borderLeft: `4px solid ${incident.severity === 'critical' ? '#dc3545' : incident.severity === 'warning' ? '#ffc107' : '#007bff'}`
                            }}>
                                <Flex direction="vertical" gap={8}>
                                <Flex direction="horizontal" align="center" justify="space-between">
                                    <Text size="p2" weight="bold">{incident.description}</Text>
                                    <Flex direction="horizontal" gap={8}>
                                    <Button
                                        icon={isCollapsed ? <PlusSquare size={20} weight="bold" color="#054bf0"/> : <MinusSquare size={20} weight="bold" color="#054bf0"/>}
                                        kind="tertiary"
                                        onClick={() => toggleIncident(incidentKey)}
                                        />
                                    
                                    </Flex>
                                </Flex>
                                
                                {!isCollapsed && (
                                    <Flex direction="vertical" gap={4}>
                                    <Text size="p3">
                                        <strong>ID:</strong> {incident.id} | <strong>Type:</strong> {incident.type}
                                    </Text>
                                    <Text size="p3">
                                        <strong>Started:</strong> {incident.startTime} | <strong>Duration:</strong> {incident.duration}
                                    </Text>
                                    <Text size="p3">
                                        <strong>Status:</strong> {incident.status} | <strong>Severity:</strong> {incident.severity}
                                    </Text>
                                    {incident.resourceType && (
                                        <Text size="p3">
                                        <strong>Resource:</strong> {incident.resourceType}
                                        </Text>
                                    )}
                                    </Flex>
                                )}
                                </Flex>
                            </Card>
                            );
                        })
                        ) : (
                        <Card style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                            <Flex direction="horizontal" align="center" gap={8}>
                            <Text size="p3" style={{ color: '#6c757d' }}>
                                ℹ️ There is no available incident data at the Controller level.
                            </Text>
                            </Flex>
                        </Card>
                        )}
                    </Flex>

                    {/* Account Level Incidents */}
                    <Flex direction="vertical" gap={12}>
                        <Text size="p1" weight="bold">Account Level</Text>
                        {currentData.incidents.account.length > 0 ? (
                        currentData.incidents.account.map((incident: any, index: number) => {
                            const incidentKey = `account-${index}`;
                            const isCollapsed = collapsedIncidents[incidentKey] !== false;
                            
                            return (
                            <Card key={incidentKey} style={{ 
                                border: `1px solid ${incident.severity === 'critical' ? '#dc3545' : incident.severity === 'warning' ? '#ffc107' : '#007bff'}`,
                                borderLeft: `4px solid ${incident.severity === 'critical' ? '#dc3545' : incident.severity === 'warning' ? '#ffc107' : '#007bff'}`
                            }}>
                                <Flex direction="vertical" gap={8}>
                                <Flex direction="horizontal" align="center" justify="space-between">
                                    <Text size="p2" weight="bold">{incident.description}</Text>
                                    <Flex direction="horizontal" gap={8}>
                                    <Button 
                                        size="small" 
                                        variant="tertiary"
                                        onClick={() => toggleIncident(incidentKey)}
                                    >
                                        {isCollapsed ? '▼ Expand' : '▲ Collapse'}
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="tertiary"
                                        onClick={() => console.log(`Dismiss ${incident.id}`)}
                                    >
                                        ×
                                    </Button>
                                    </Flex>
                                </Flex>
                                
                                {!isCollapsed && (
                                    <Flex direction="vertical" gap={4}>
                                    <Text size="p3">
                                        <strong>ID:</strong> {incident.id} | <strong>Type:</strong> {incident.type}
                                    </Text>
                                    <Text size="p3">
                                        <strong>Started:</strong> {incident.startTime} | <strong>Duration:</strong> {incident.duration}
                                    </Text>
                                    <Text size="p3">
                                        <strong>Status:</strong> {incident.status} | <strong>Severity:</strong> {incident.severity}
                                    </Text>
                                    </Flex>
                                )}
                                </Flex>
                            </Card>
                            );
                        })
                        ) : (
                        <Card style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                            <Flex direction="horizontal" align="center" gap={8}>
                            <Text size="p3" style={{ color: '#6c757d' }}>
                                ℹ️ There is no available incident data at the Account level.
                            </Text>
                            </Flex>
                        </Card>
                        )}
                    </Flex>

                    {/* Cluster Level Incidents */}
                    <Flex direction="vertical" gap={12}>
                        <Text size="p1" weight="bold">Cluster Level</Text>
                        {currentData.incidents.cluster.length > 0 ? (
                        currentData.incidents.cluster.map((incident: any, index: number) => {
                            const incidentKey = `cluster-${index}`;
                            const isCollapsed = collapsedIncidents[incidentKey] !== false;
                            
                            return (
                            <Card key={incidentKey} style={{ 
                                border: `1px solid ${incident.severity === 'critical' ? '#dc3545' : incident.severity === 'warning' ? '#ffc107' : '#007bff'}`,
                                borderLeft: `4px solid ${incident.severity === 'critical' ? '#dc3545' : incident.severity === 'warning' ? '#ffc107' : '#007bff'}`
                            }}>
                                <Flex direction="vertical" gap={8}>
                                <Flex direction="horizontal" align="center" justify="space-between">
                                    <Text size="p2" weight="bold">{incident.description}</Text>
                                    <Flex direction="horizontal" gap={8}>
                                    <Button 
                                        size="small" 
                                        variant="tertiary"
                                        onClick={() => toggleIncident(incidentKey)}
                                    >
                                        {isCollapsed ? '▼ Expand' : '▲ Collapse'}
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="tertiary"
                                        onClick={() => console.log(`Dismiss ${incident.id}`)}
                                    >
                                        ×
                                    </Button>
                                    </Flex>
                                </Flex>
                                
                                {!isCollapsed && (
                                    <Flex direction="vertical" gap={4}>
                                    <Text size="p3">
                                        <strong>ID:</strong> {incident.id} | <strong>Type:</strong> {incident.type}
                                    </Text>
                                    <Text size="p3">
                                        <strong>Started:</strong> {incident.startTime} | <strong>Duration:</strong> {incident.duration}
                                    </Text>
                                    <Text size="p3">
                                        <strong>Status:</strong> {incident.status} | <strong>Severity:</strong> {incident.severity}
                                    </Text>
                                    </Flex>
                                )}
                                </Flex>
                            </Card>
                            );
                        })
                        ) : (
                        <Card style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                            <Flex direction="horizontal" align="center" gap={8}>
                            <Text size="p3" style={{ color: '#6c757d' }}>
                                ℹ️ There is no available incident data at the Cluster level.
                            </Text>
                            </Flex>
                        </Card>
                        )}
                    </Flex>
                    </Flex>
                </Container>
                )}

                {activeView === 'limits' && (
                <Flex direction="horizontal" gap={16}>
                    <Container style={{ flex: 1 }}>
                    <Flex direction="vertical" gap={12}>
                        <Heading size="sub-section">Controller Limits</Heading>
                        <Table
                        size="compact"
                        columns={[
                            { accessorKey: 'resource', header: 'Metric' },
                            { accessorKey: 'current', header: 'Current' },
                            { accessorKey: 'limit', header: 'Limit' },
                            { 
                            accessorKey: 'percentage', 
                            header: 'Usage %',
                            cell: (info: any) => {
                                const value = parseInt(info.getValue().replace('%', ''));
                                const used = value;
                                const unused = 100 - value;
                                const barColor = value >= 80 ? '#dc3545' : value >= 60 ? '#ffc107' : '#28a745';
                                
                                const data = [{
                                id: 'usage',
                                Used: used,
                                Unused: unused
                                }];

                                return (
                                <div style={{ minWidth: '80px', height: '24px' }}>
                                    <BarChart
                                    data={data}
                                    indexBy="id"
                                    isInteractive={false}
                                    keys={["Used", "Unused"]}
                                    patternIds={["Unused"]}
                                    progress={95}
                                    width={80}
                                    height={10}
                                    colors={[barColor, '#e9ecef']}
                                    />
                                </div>
                                );
                            }
                            }
                        ]}
                        data={[
                            { resource: 'Account', current: '1000', limit: '2000', percentage: '50%' },
                            { resource: 'Application', current: '18000', limit: '20000', percentage: '80%' },
                            { resource: 'Backend', current: '5940', limit: '100000', percentage: '10%' },
                            { resource: 'BusinessTransaction', current: '44690', limit: '300000', percentage: '24%' },
                            { resource: 'Collections', current: '0', limit: '40000', percentage: '0%' },
                            { resource: 'Error', current: '58030', limit: '100000', percentage: '58%' },
                            { resource: 'Memory', current: '8000', limit: '40000', percentage: '20%' },
                            { resource: 'Node', current: '9061', limit: '600000', percentage: '15%' },
                            { resource: 'ServiceEndpoint', current: '20096', limit: '100000', percentage: '20%' },
                            { resource: 'StackTrace', current: '82200', limit: '6000000', percentage: '80%' },
                            { resource: 'Thread', current: '36450', limit: '100000', percentage: '36%' },
                            { resource: 'Tier', current: '6143', limit: '100000', percentage: '60%' },
                            { resource: 'TrackedObject', current: '3280', limit: '40000', percentage: '8%' }
                        ]}
                        />
                    </Flex>
                    </Container>

                    <Container style={{ flex: 1 }}>
                    <Flex direction="vertical" gap={12}>
                        <Heading size="sub-section">Account Limits</Heading>
                        <Table
                        size="compact"
                        columns={[
                            { accessorKey: 'resource', header: 'Metric' },
                            { accessorKey: 'current', header: 'Current' },
                            { accessorKey: 'limit', header: 'Limit' },
                            { 
                            accessorKey: 'percentage', 
                            header: 'Usage %',
                            cell: (info: any) => {
                                const value = parseInt(info.getValue().replace('%', ''));
                                const used = value;
                                const unused = 100 - value;
                                const barColor = value >= 80 ? '#dc3545' : value >= 60 ? '#ffc107' : '#28a745';
                                
                                const data = [{
                                id: 'usage',
                                Used: used,
                                Unused: unused
                                }];

                                return (
                                <div style={{ minWidth: '80px', height: '24px' }}>
                                    <BarChart
                                    data={data}
                                    indexBy="id"
                                    isInteractive={false}
                                    keys={["Used", "Unused"]}
                                    patternIds={["Unused"]}
                                    progress={95}
                                    width={80}
                                    height={10}
                                    colors={[barColor, '#e9ecef']}
                                    />
                                </div>
                                );
                            }
                            }
                        ]}
                        data={[
                            { resource: 'Account', current: '1000', limit: '2000', percentage: '30%' },
                            { resource: 'Application', current: '18000', limit: '20000', percentage: '60%' },
                            { resource: 'Backend', current: '5940', limit: '100000', percentage: '5%' },
                            { resource: 'BusinessTransaction', current: '44690', limit: '300000', percentage: '12%' },
                            { resource: 'Collections', current: '0', limit: '40000', percentage: '0%' },
                            { resource: 'Error', current: '58030', limit: '100000', percentage: '46%' },
                            { resource: 'Memory', current: '8000', limit: '40000', percentage: '20%' },
                            { resource: 'Node', current: '9061', limit: '600000', percentage: '15%' },
                            { resource: 'ServiceEndpoint', current: '20096', limit: '100000', percentage: '5%' },
                            { resource: 'StackTrace', current: '82200', limit: '6000000', percentage: '50%' },
                            { resource: 'Thread', current: '36450', limit: '100000', percentage: '20%' },
                            { resource: 'Tier', current: '6143', limit: '100000', percentage: '40%' },
                            { resource: 'TrackedObject', current: '3280', limit: '40000', percentage: '8%' }
                        ]}
                        />
                    </Flex>
                    </Container>
                </Flex>
                )}

                {activeView === 'executeQuery' && (
                    <Container>
                        <Flex direction="vertical" gap={24}>
                            <Heading size="sub-section">Execute Query</Heading>
                            
                            {/* Query Selection */}
                            <Card>
                                <Flex direction="vertical" gap={16}>
                                    <Heading size="sub-section">Select Query</Heading>
                                    <select
                                        value={selectedQuery}
                                        onChange={(e) => {
                                            setSelectedQuery(e.target.value);
                                            setQueryParameters({});
                                            setQueryResults(null);
                                            setQueryError('');
                                        }}
                                        style={{ 
                                            minWidth: '300px',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Choose a predefined query</option>
                                        {predefinedQueries.map((query) => (
                                            <option key={query.id} value={query.id}>
                                                {query.name}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {selectedQuery && (
                                        <Text color="light" size="p2">
                                            {predefinedQueries.find(q => q.id === selectedQuery)?.description}
                                        </Text>
                                    )}
                                </Flex>
                            </Card>

                            {/* Parameters Input */}
                            {selectedQuery && (
                                <Card>
                                    <Flex direction="vertical" gap={16}>
                                        <Heading size="sub-section">Query Parameters</Heading>
                                        {predefinedQueries
                                            .find(q => q.id === selectedQuery)
                                            ?.parameters.map((param) => (
                                            <Flex key={param.name} direction="vertical" gap={4}>
                                                <Text size="p2" weight="medium">
                                                    {param.label} {param.required && <span style={{ color: 'red' }}>*</span>}
                                                </Text>
                                                <Input
                                                    label=""
                                                    type={param.type === 'number' ? 'number' : param.type === 'date' ? 'datetime-local' : 'text'}
                                                    placeholder={param.placeholder || `Enter ${param.label.toLowerCase()}`}
                                                    value={queryParameters[param.name] || ''}
                                                    onChange={(e) => 
                                                        setQueryParameters(prev => ({
                                                            ...prev,
                                                            [param.name]: e.target.value
                                                        }))
                                                    }
                                                    style={{ maxWidth: '300px' }}
                                                />
                                            </Flex>
                                        ))}
                                        
                                        <Button 
                                            kind="primary" 
                                            onClick={executeQuery}
                                            disabled={isExecuting}
                                            style={{ alignSelf: 'flex-start' }}
                                        >
                                            {isExecuting ? 'Executing...' : 'Execute Query'}
                                        </Button>
                                    </Flex>
                                </Card>
                            )}

                            {/* Query Display */}
                            {selectedQuery && (
                                <Card>
                                    <Flex direction="vertical" gap={8}>
                                        <Heading size="sub-section">SQL Query</Heading>
                                        <div style={{ 
                                            backgroundColor: '#f8f9fa', 
                                            padding: '12px', 
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '14px',
                                            border: '1px solid #dee2e6'
                                        }}>
                                            {predefinedQueries.find(q => q.id === selectedQuery)?.query}
                                        </div>
                                    </Flex>
                                </Card>
                            )}

                            {/* Error Display */}
                            {queryError && (
                                <Card accent="negative">
                                    <Flex direction="vertical" gap={8}>
                                        <Heading size="sub-section">Error</Heading>
                                        <Text color="light" size="p2">{queryError}</Text>
                                    </Flex>
                                </Card>
                            )}

                            {/* Results Table */}
                            {queryResults && (
                                <Card>
                                    <Flex direction="vertical" gap={16}>
                                        <Heading size="sub-section">Query Results</Heading>
                                        <div style={{ overflow: 'auto' }}>
                                            <table style={{ 
                                                width: '100%', 
                                                borderCollapse: 'collapse',
                                                fontSize: '14px'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                        {queryResults.columns.map((col, index) => (
                                                            <th key={index} style={{ 
                                                                padding: '12px', 
                                                                textAlign: 'left',
                                                                borderBottom: '2px solid #dee2e6',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {col}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {queryResults.rows.map((row, rowIndex) => (
                                                        <tr key={rowIndex} style={{
                                                            backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                                        }}>
                                                            {row.map((cell, cellIndex) => (
                                                                <td key={cellIndex} style={{ 
                                                                    padding: '12px',
                                                                    borderBottom: '1px solid #dee2e6'
                                                                }}>
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Text color="light" size="p3">
                                            {queryResults.rows.length} row(s) returned
                                        </Text>
                                    </Flex>
                                </Card>
                            )}
                        </Flex>
                    </Container>
                )}
            </Flex>
            
        </Container>
        </>
        )}
      
      </Flex>
     
    </Container>
  );
};

export default EnvironmentPanel;