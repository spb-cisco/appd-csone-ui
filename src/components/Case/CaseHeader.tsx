import React from 'react';
import { Button } from '@magnetic/button';
import { Text } from '@magnetic/text';
import { ViewSwitcher } from '@magnetic/view-switcher';
import { Heading } from '@magnetic/heading';
import { Link } from '@magnetic/link';
import './CaseHeader.css';

interface CaseData {
  id: string;
  title: string;
  severity: string;
  age: string;
  status: string;
  owner: {
    name: string;
    username: string;
    team: string;
  };
  customer: {
    name: string;
    company: string;
    phone: string;
  };
  keywords: {
    technology: string;
    subTechnology: string;
    problemCategory: string;
    tag: string;
  };
  product: {
    serialNumber: string;
    contract: string;
    productId: string;
    node: string;
    crossLaunch: string;
  };
}

interface CaseHeaderProps {
  caseData?: CaseData;
  onUpdate?: () => void;
  onAddNote?: () => void;
}

const CaseHeader: React.FC<CaseHeaderProps> = ({ 
  caseData = {
    id: '699765332',
    title: 'Windows server increase in CPU usage from AppD and OTel agents running on the same server',
    severity: 'S2',
    age: '1d',
    status: 'Ext: Cisco Pending',
    owner: {
      name: 'Soumyapratim Bera',
      username: 'soubera',
      team: 'TAC-SAAS-APPDOTNET-AMER-WEST-TCE'
    },
    customer: {
      name: 'Sultan Kaja',
      company: 'C3 TO BE ASSIGNED CPR COMPANY',
      phone: '+1 913 952 6721'
    },
    keywords: {
      technology: 'AppDynamics',
      subTechnology: 'AppDynamics - .NET',
      problemCategory: 'Interoperability',
      tag: 'N/A'
    },
    product: {
      serialNumber: 'N/A',
      contract: 'N/A',
      productId: 'N/A',
      node: 'N/A',
      crossLaunch: 'AppDynamics'
    }
  },
  onUpdate,
  onAddNote
}) => {
  const tags = [
    'routing', 'open collab', 'on hold', 'clone case', 
    'entitlement', 'case review', 'team mgmt', 'close case', 'copilot close'
  ];

  // Convert tags to ViewSwitcher options
  const tagOptions = tags.map(tag => ({
    value: tag,
    label: tag,
    content: tag
  }));

  const [selectedTag, setSelectedTag] = React.useState(tags[0]);

  return (
    <article className="case-header">
      <div className="case-top-row">
        <div className="case-left">
          <div className="case-badges">
            <Text className="status-badge">{caseData.severity}</Text>
            <Text className="case-id">{caseData.id}</Text>
            <Text className="age-badge">Age: {caseData.age}</Text>
          </div>
          <Text className="case-title-text">{caseData.title}</Text>
        </div>
        
        <div className="case-right">
          <Text className="status-pill">{caseData.status}</Text>
          <div className="action-buttons">
            <Button 
              variant="primary" 
              onClick={onUpdate}
              className="btn-update"
            >
              Customer Updated ▼
            </Button>
            <Button 
              variant="primary" 
              onClick={onAddNote}
              className="btn-add-note"
            >
              📝 Add Note
            </Button>
          </div>
        </div>
      </div>
      
      <div className="case-metadata">
        <div className="meta-section">
          <Heading className="meta-header">Keywords</Heading>
          <div className="meta-content">
            <div className="meta-item">
              <Text className="meta-label">T:</Text>
              <Text className="meta-value">{caseData.keywords.technology}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">ST:</Text>
              <Text className="meta-value">{caseData.keywords.subTechnology}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">PC:</Text>
              <Text className="meta-value">{caseData.keywords.problemCategory}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">Tag:</Text>
              <Text className="meta-value">{caseData.keywords.tag}</Text>
            </div>
          </div>
        </div>
        
        <div className="meta-section">
          <Heading className="meta-header">Product</Heading>
          <div className="meta-content">
            <div className="meta-item">
              <Text className="meta-label">SN:</Text>
              <Text className="meta-value">{caseData.product.serialNumber}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">Contract:</Text>
              <Text className="meta-value">{caseData.product.contract}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">Product ID:</Text>
              <Text className="meta-value">{caseData.product.productId}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">Node:</Text>
              <Text className="meta-value">{caseData.product.node}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-label">Cross Launch:</Text>
              <Text className="meta-value">
                <Link href="#">{caseData.product.crossLaunch}</Link>
              </Text>
            </div>
          </div>
        </div>
        
        <div className="meta-section">
          <Heading className="meta-header">Owner</Heading>
          <div className="meta-content">
            <div className="meta-item">
              <Text className="meta-value">🟢 {caseData.owner.name} ({caseData.owner.username})</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-value">{caseData.owner.team}</Text>
            </div>
          </div>
        </div>
        
        <div className="meta-section">
          <Heading className="meta-header">Customer</Heading>
          <div className="meta-content">
            <div className="meta-item">
              <Text className="meta-value">🟢 {caseData.customer.name}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-value">{caseData.customer.company}</Text>
            </div>
            <div className="meta-item">
              <Text className="meta-value">📞 {caseData.customer.phone}</Text>
            </div>
          </div>
        </div>
      </div>
      
      <ViewSwitcher
        options={tagOptions}
        value={selectedTag}
        onChange={setSelectedTag}
        aria-label="Case management actions"
      />
    </article>
  );
};

export default CaseHeader;